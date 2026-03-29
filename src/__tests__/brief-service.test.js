import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readSnapshot, writeSnapshot } from '../services/brief-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SNAPSHOTS_DIR = join(__dirname, '../data/snapshots');
const TEST_DATE = '2099-01-01';
const TEST_FILE = join(SNAPSHOTS_DIR, `${TEST_DATE}.json`);

// Cleanup test files
afterAll(() => {
  try { unlinkSync(TEST_FILE); } catch { /* ignore */ }
});

describe('readSnapshot', () => {
  it('returns null for non-existent date', () => {
    const result = readSnapshot('2099-12-31');
    expect(result).toBeNull();
  });

  it('returns null for invalid date string (path traversal guard)', () => {
    expect(readSnapshot('../../etc/passwd')).toBeNull();
    expect(readSnapshot('2025-13-45-extra')).toBeNull();
    expect(readSnapshot('')).toBeNull();
  });

  it('reads a valid snapshot file', () => {
    const testData = { date: TEST_DATE, prices: [{ slug: 'silver', value: 30.0 }] };
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    writeFileSync(TEST_FILE, JSON.stringify(testData));

    const result = readSnapshot(TEST_DATE);
    expect(result).not.toBeNull();
    expect(result.date).toBe(TEST_DATE);
    expect(result.prices[0].slug).toBe('silver');

    unlinkSync(TEST_FILE);
  });

  it('returns null for corrupt JSON', () => {
    writeFileSync(TEST_FILE, '{ invalid json !!!');
    const result = readSnapshot(TEST_DATE);
    expect(result).toBeNull();
    unlinkSync(TEST_FILE);
  });
});

describe('writeSnapshot', () => {
  it('writes a snapshot file', () => {
    const prices = [{ slug: 'silver', price: { value: 31.5, unit: 'USD/oz', source: 'yahoo', coverageTier: 'live_exchange', change24hPct: 1.2 } }];
    const result = writeSnapshot(TEST_DATE, prices);
    expect(result).toBe(true);
    expect(existsSync(TEST_FILE)).toBe(true);

    const written = JSON.parse(readFileSync(TEST_FILE, 'utf-8'));
    expect(written.date).toBe(TEST_DATE);
    expect(written.prices[0].slug).toBe('silver');
    expect(written.prices[0].value).toBe(31.5);
  });

  it('skips write if file already exists (write-once guard)', () => {
    // File from previous test should still exist
    const result = writeSnapshot(TEST_DATE, []);
    expect(result).toBe(true);

    // Verify original content is preserved (not overwritten with empty)
    const content = JSON.parse(readFileSync(TEST_FILE, 'utf-8'));
    expect(content.prices).toHaveLength(1);
  });

  it('rejects invalid date string', () => {
    const result = writeSnapshot('../../evil', []);
    expect(result).toBe(false);
  });
});

describe('computeBrief (integration)', () => {
  let computeBrief;

  beforeAll(async () => {
    const mod = await import('../services/brief-service.js');
    computeBrief = mod.computeBrief;
  });

  it('returns valid brief object', async () => {
    const brief = await computeBrief();
    expect(brief).toHaveProperty('date');
    expect(brief).toHaveProperty('movers');
    expect(brief).toHaveProperty('meta');
    expect(brief.meta).toHaveProperty('liveMaterials');
    expect(brief.meta).toHaveProperty('totalMaterials');
    expect(Array.isArray(brief.movers)).toBe(true);
  });

  it('movers have correct shape when present', async () => {
    const brief = await computeBrief();

    // On first run (no yesterday snapshot), noData should be true
    if (brief.noData) {
      expect(brief.reason).toBe('no_prior_snapshot');
      expect(brief.movers).toHaveLength(0);
    } else {
      // If we have data, verify mover shape
      for (const mover of brief.movers) {
        expect(mover).toHaveProperty('material');
        expect(mover).toHaveProperty('name');
        expect(mover).toHaveProperty('priceDeltaPct');
        expect(mover).toHaveProperty('topImpact');
        expect(mover.topImpact).toHaveProperty('system');
        expect(mover.topImpact).toHaveProperty('delta');
        expect(mover.topImpact).toHaveProperty('costUnit');
      }
    }
  });

  it('movers limited to 5', async () => {
    const brief = await computeBrief();
    expect(brief.movers.length).toBeLessThanOrEqual(5);
  });

  it('movers sorted by absolute impact (descending)', async () => {
    const brief = await computeBrief();
    for (let i = 1; i < brief.movers.length; i++) {
      expect(Math.abs(brief.movers[i - 1].topImpact.delta))
        .toBeGreaterThanOrEqual(Math.abs(brief.movers[i].topImpact.delta));
    }
  });
});
