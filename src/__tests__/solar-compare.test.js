import { describe, it, expect } from 'vitest';
import { calculateSolarCost } from '../services/solar-model-service.js';

/**
 * Tests for the solar-compare endpoint logic.
 * We test the core calculation layer directly (same as the endpoint uses).
 */
describe('Solar Country Comparison', () => {
  describe('Valid 3-country comparison (VN, CN, IN)', () => {
    const countries = ['VN', 'CN', 'IN'];
    const results = countries.map(c => ({
      country: c,
      cost: calculateSolarCost(c, 'topcon', 2025),
    }));

    it('returns valid cost for each country', () => {
      results.forEach(r => {
        expect(r.cost.totalCostPerWp).toBeGreaterThan(0.10);
        expect(r.cost.totalCostPerWp).toBeLessThan(0.50);
        expect(r.cost.stageBreakdown).toHaveLength(4);
      });
    });

    it('all 3 countries produce distinct totals', () => {
      const totals = results.map(r => r.cost.totalCostPerWp);
      const unique = new Set(totals);
      expect(unique.size).toBe(3);
    });

    it('cheapest country is China', () => {
      const cheapest = results.reduce((min, r) =>
        r.cost.totalCostPerWp < min.cost.totalCostPerWp ? r : min
      );
      expect(cheapest.country).toBe('CN');
    });

    it('delta vs cheapest is correct', () => {
      const cheapestCost = Math.min(...results.map(r => r.cost.totalCostPerWp));
      results.forEach(r => {
        const expectedDelta = Math.round((r.cost.totalCostPerWp - cheapestCost) * 10000) / 10000;
        expect(expectedDelta).toBeGreaterThanOrEqual(0);
        if (r.country === 'CN') {
          expect(expectedDelta).toBe(0);
        } else {
          expect(expectedDelta).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('All 6 countries comparison', () => {
    const countries = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    const results = countries.map(c => ({
      country: c,
      totalCostPerWp: calculateSolarCost(c, 'topcon', 2025).totalCostPerWp,
    }));

    it('all 6 produce valid, positive costs', () => {
      results.forEach(r => {
        expect(Number.isFinite(r.totalCostPerWp)).toBe(true);
        expect(r.totalCostPerWp).toBeGreaterThan(0);
      });
    });

    it('spread between cheapest and most expensive is reasonable (< $0.20/Wp)', () => {
      const min = Math.min(...results.map(r => r.totalCostPerWp));
      const max = Math.max(...results.map(r => r.totalCostPerWp));
      expect(max - min).toBeLessThan(0.20);
      expect(max - min).toBeGreaterThan(0);
    });
  });

  describe('Stage breakdown consistency across countries', () => {
    it('stage costs sum to total for each country', () => {
      const countries = ['CN', 'VN', 'DE'];
      countries.forEach(c => {
        const result = calculateSolarCost(c, 'topcon', 2025);
        const stageSum = result.stageBreakdown.reduce((sum, s) => sum + s.costPerWp, 0);
        expect(Math.abs(stageSum - result.totalCostPerWp)).toBeLessThan(0.001);
      });
    });
  });

  describe('Mono technology comparison', () => {
    it('mono costs differ across countries', () => {
      const countries = ['CN', 'VN', 'IN'];
      const totals = countries.map(c => calculateSolarCost(c, 'mono', 2025).totalCostPerWp);
      const unique = new Set(totals);
      expect(unique.size).toBe(3);
    });
  });
});
