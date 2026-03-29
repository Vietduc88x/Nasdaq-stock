/**
 * Landed Cost Engine — EXW → FOB → CIF → DDP calculator
 *
 * Calculates the landed cost of solar PV modules across trade routes,
 * applying real tariff rates, ocean freight, insurance, and customs fees.
 *
 *  COST CHAIN:
 *  ┌─────┐   ┌──────────────┐   ┌─────┐   ┌──────────────┐   ┌─────┐
 *  │ EXW │ → │ + inland     │ → │ FOB │ → │ + ocean      │ → │ CIF │
 *  │     │   │ + port       │   │     │   │ + insurance   │   │     │
 *  └─────┘   └──────────────┘   └─────┘   └──────────────┘   └─────┘
 *                                                                 │
 *                                                                 ▼
 *  ┌─────┐   ┌──────────────────────────────────────────────┐   ┌─────┐
 *  │ DDP │ ← │ + customs duty + AD + CVD + clearance + del. │ ← │ CIF │
 *  └─────┘   └──────────────────────────────────────────────┘   └─────┘
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tradeData = JSON.parse(
  readFileSync(join(__dirname, '../data/trade/landed-cost-v2026.json'), 'utf-8')
);

const MODEL_VERSION = tradeData.version;

function round5(n) { return Math.round(n * 100000) / 100000; }
function round4(n) { return Math.round(n * 10000) / 10000; }

/**
 * Get all available routes.
 */
export function getAvailableRoutes() {
  return tradeData.routes.map(r => ({
    from: r.from,
    to: r.to,
    label: r.label,
    confidence: r.confidence,
  }));
}

/**
 * Find a route by from/to pair.
 */
function findRoute(from, to) {
  return tradeData.routes.find(r => r.from === from && r.to === to) || null;
}

/**
 * Calculate landed cost for a specific route.
 *
 * @param {{ from: string, to: string, product?: string, exw: number }} params
 * @returns {object} Full breakdown with FOB, CIF, DDP stages
 */
export function calculateLandedCost({ from, to, product = 'module', exw }) {
  if (product !== 'module') {
    throw new RangeError(`Unsupported product: ${product}. Only 'module' is supported.`);
  }
  if (typeof exw !== 'number' || !Number.isFinite(exw) || exw <= 0) {
    throw new RangeError(`Invalid EXW value: ${exw}. Must be a positive number.`);
  }
  if (exw > 5) {
    throw new RangeError(`EXW ${exw} $/Wp seems unreasonably high. Max 5 $/Wp.`);
  }

  const route = findRoute(from, to);
  if (!route) {
    const valid = tradeData.routes.map(r => `${r.from}→${r.to}`).join(', ');
    throw new RangeError(`Unsupported route: ${from}→${to}. Valid routes: ${valid}`);
  }

  const c = route.costs;

  // 1. EXW (factory gate)
  const exwCost = exw;

  // 2. FOB = EXW + inland freight + port handling
  const inlandFreight = c.inlandFreightPerWp;
  const portHandling = c.portHandlingPerWp;
  const fob = round5(exwCost + inlandFreight + portHandling);

  // 3. Ocean freight
  const oceanFreight = c.oceanFreightPerWp;

  // 4. Insurance = (FOB + ocean freight) * insurance rate
  // Insurance is calculated on FOB + freight value (approximation of CIF base)
  const insuranceBase = fob + oceanFreight;
  const insurance = round5(insuranceBase * (c.insuranceRatePct / 100));

  // 5. CIF = FOB + ocean freight + insurance
  const cif = round5(fob + oceanFreight + insurance);

  // 6. Duties on CIF value
  const customsDuty = round5(cif * (c.customsDutyPct / 100));
  const antiDumping = round5(cif * (c.antiDumpingPct / 100));
  const countervailing = round5(cif * (c.countervailingPct / 100));

  // 7. Clearance and delivery
  const customsClearance = c.customsClearancePerWp;
  const inlandDelivery = c.inlandDeliveryPerWp;

  // 8. DDP = CIF + all duties + clearance + delivery
  const ddp = round5(cif + customsDuty + antiDumping + countervailing + customsClearance + inlandDelivery);

  // NaN guard
  const values = [exwCost, fob, cif, ddp, customsDuty, antiDumping, countervailing];
  for (const v of values) {
    if (!Number.isFinite(v)) {
      throw new Error(`Calculation produced non-finite value on route ${from}→${to}`);
    }
  }

  const totalAddersPerWp = round5(ddp - exwCost);
  const ddpPremiumPct = round4((totalAddersPerWp / exwCost) * 100);

  // Waterfall stages for chart rendering
  const waterfall = [
    { stage: 'EXW (Factory)', costPerWp: round5(exwCost) },
    { stage: 'Inland Freight', costPerWp: round5(inlandFreight) },
    { stage: 'Port Handling', costPerWp: round5(portHandling) },
    { stage: 'Ocean Freight', costPerWp: round5(oceanFreight) },
    { stage: 'Insurance', costPerWp: round5(insurance) },
    { stage: 'Customs Duty', costPerWp: round5(customsDuty) },
    { stage: 'Anti-Dumping', costPerWp: round5(antiDumping) },
    { stage: 'Countervailing', costPerWp: round5(countervailing) },
    { stage: 'Customs Clearance', costPerWp: round5(customsClearance) },
    { stage: 'Inland Delivery', costPerWp: round5(inlandDelivery) },
  ].filter(s => s.costPerWp > 0);

  return {
    params: { from, to, product, exw },
    model: {
      version: MODEL_VERSION,
      asOf: route.asOf,
      hsCode: tradeData.hsCode,
      source: route.source,
      confidence: route.confidence,
      notes: route.notes,
      transitDays: route.transitDays,
    },
    breakdown: {
      exw: round5(exwCost),
      inlandFreight: round5(inlandFreight),
      portHandling: round5(portHandling),
      fob,
      oceanFreight: round5(oceanFreight),
      insurance: round5(insurance),
      cif,
      customsDuty,
      antiDumping,
      countervailing,
      customsClearance: round5(customsClearance),
      inlandDelivery: round5(inlandDelivery),
      ddp,
    },
    waterfall,
    summary: {
      totalAddersPerWp,
      ddpPremiumPct,
    },
  };
}

/**
 * Calculate landed cost for all routes (comparison mode).
 */
export function calculateAllRoutes(exw, product = 'module') {
  const results = [];
  for (const route of tradeData.routes) {
    try {
      const result = calculateLandedCost({ from: route.from, to: route.to, product, exw });
      results.push({
        from: route.from,
        to: route.to,
        label: route.label,
        confidence: route.confidence,
        fob: result.breakdown.fob,
        cif: result.breakdown.cif,
        ddp: result.breakdown.ddp,
        premiumPct: result.summary.ddpPremiumPct,
        transitDays: route.transitDays,
      });
    } catch (err) {
      console.warn(`[landed-cost] Skipping route ${route.from}→${route.to}: ${err.message}`);
    }
  }
  results.sort((a, b) => a.ddp - b.ddp);
  return results;
}

/**
 * Get model metadata.
 */
export function getLandedCostMeta() {
  return {
    version: MODEL_VERSION,
    product: tradeData.product,
    hsCode: tradeData.hsCode,
    asOf: tradeData.asOf,
    routeCount: tradeData.routes.length,
    provenanceNote: tradeData.provenanceNote,
  };
}
