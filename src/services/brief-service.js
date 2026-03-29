/**
 * Morning Brief Service — daily material movers → cost impact
 *
 * Computes the top material price movers and their cross-system cost impact
 * by comparing today's prices to yesterday's persisted snapshot.
 *
 *  DATA FLOW:
 *  ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
 *  │ Read yesterday's │ →  │  getAllPrices()   │ →  │ For each live    │
 *  │ snapshot (JSON)  │     │  (today's prices) │     │ material: delta  │
 *  └────────┬────────┘     └────────┬─────────┘     │ + impact calc    │
 *           │                       │                └────────┬─────────┘
 *    [NOT FOUND] → noData    [PARTIAL FAIL] →          │
 *    [CORRUPT]  → noData      silent degrade      ┌────┴─────────┐
 *                                                  │ Rank by      │
 *                                                  │ |cost impact| │
 *                                                  │ → top 5      │
 *                                                  └────┬─────────┘
 *                                                       │
 *                                              ┌────────┴────────┐
 *                                              │ Lazy-write      │
 *                                              │ today's snapshot │
 *                                              │ (non-blocking)   │
 *                                              └─────────────────┘
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getAllPrices } from './market-data-service.js';
import { calculateImpact } from './impact-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SNAPSHOTS_DIR = join(__dirname, '../data/snapshots');

/**
 * Format date as YYYY-MM-DD string.
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Validate date string matches YYYY-MM-DD (path traversal guard).
 */
function isValidDateString(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

/**
 * Read a snapshot file for a given date. Returns null on any failure.
 */
export function readSnapshot(dateStr) {
  if (!isValidDateString(dateStr)) return null;

  const filePath = join(SNAPSHOTS_DIR, `${dateStr}.json`);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // ENOENT (first day) or SyntaxError (corrupt file) — both return null
    return null;
  }
}

/**
 * Write today's snapshot. Non-blocking in spirit: failures are logged, not thrown.
 * Uses existsSync guard to avoid repeated writes.
 */
export function writeSnapshot(dateStr, prices) {
  if (!isValidDateString(dateStr)) return false;

  const filePath = join(SNAPSHOTS_DIR, `${dateStr}.json`);

  // Write-once guard: skip if already written today
  if (existsSync(filePath)) return true;

  try {
    // Ensure directory exists
    if (!existsSync(SNAPSHOTS_DIR)) {
      mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    }

    const snapshot = {
      date: dateStr,
      writtenAt: new Date().toISOString(),
      prices: prices.map(p => ({
        slug: p.slug,
        value: p.price?.value ?? null,
        unit: p.price?.unit ?? null,
        source: p.price?.source ?? 'reference',
        coverageTier: p.price?.coverageTier ?? 'unknown',
        change24hPct: p.price?.change24hPct ?? null,
      })),
    };

    writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    return true;
  } catch (err) {
    // ENOSPC, EACCES — log and continue, request should not fail
    console.warn(`[brief] Failed to write snapshot ${dateStr}: ${err.message}`);
    return false;
  }
}

/**
 * Compute the Morning Brief.
 * Returns the top movers with their cross-system cost impact.
 */
export async function computeBrief() {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // Fetch today's prices
  const todayPrices = await getAllPrices();

  // Lazy-write today's snapshot (non-blocking — failures don't affect the response)
  writeSnapshot(today, todayPrices);

  // Read yesterday's snapshot
  const yesterdaySnapshot = readSnapshot(yesterday);

  if (!yesterdaySnapshot) {
    return {
      date: today,
      noData: true,
      reason: 'no_prior_snapshot',
      movers: [],
      meta: { liveMaterials: 0, totalMaterials: todayPrices.length },
    };
  }

  // Build lookup: slug → yesterday's price value
  const yesterdayMap = new Map(
    yesterdaySnapshot.prices
      .filter(p => p.value !== null)
      .map(p => [p.slug, p])
  );

  // Compute deltas for live materials
  const movers = [];
  for (const tp of todayPrices) {
    const todayPrice = tp.price;
    if (!todayPrice || todayPrice.fallbackUsed || todayPrice.source === 'reference') continue;

    const yp = yesterdayMap.get(tp.slug);
    if (!yp || yp.value === null || yp.value === 0) continue;

    const deltaPct = ((todayPrice.value - yp.value) / yp.value) * 100;
    if (Math.abs(deltaPct) < 0.01) continue; // Skip negligible changes

    // Calculate cross-system impact
    const impact = calculateImpact(tp.slug, deltaPct);
    if (!impact) continue;

    // Find the largest system impact
    const systemImpacts = impact.impacts.map(i => ({
      system: i.system,
      component: i.component,
      delta: i.delta,
      costUnit: i.costUnit,
      baselineCost: i.baselineCost,
    }));

    const maxImpact = systemImpacts.reduce((max, i) =>
      Math.abs(i.delta) > Math.abs(max.delta) ? i : max,
      systemImpacts[0]
    );

    movers.push({
      material: tp.slug,
      name: impact.name,
      priceDeltaPct: Math.round(deltaPct * 100) / 100,
      priceToday: todayPrice.value,
      priceYesterday: yp.value,
      priceUnit: todayPrice.unit,
      topImpact: maxImpact,
      allImpacts: systemImpacts,
      coverageTier: todayPrice.coverageTier,
    });
  }

  // Rank by absolute cost impact (largest impact first)
  movers.sort((a, b) => Math.abs(b.topImpact.delta) - Math.abs(a.topImpact.delta));

  const liveMaterials = todayPrices.filter(p => p.price && !p.price.fallbackUsed && p.price.source !== 'reference').length;

  return {
    date: today,
    noData: false,
    movers: movers.slice(0, 5),
    totalMovers: movers.length,
    meta: {
      liveMaterials,
      totalMaterials: todayPrices.length,
      snapshotDate: yesterday,
    },
  };
}
