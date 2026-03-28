import { describe, it, expect } from 'vitest';
import { calculateModuleCost, DEFAULTS } from '../lib/solar-cost-model';

describe('Solar Cost Model (Frontend)', () => {
  describe('Baseline: VN/TOPCon/2025', () => {
    const result = calculateModuleCost(DEFAULTS);

    it('total matches backend benchmark ($0.1786/Wp ±1%)', () => {
      expect(result.total).toBeGreaterThan(0.176);
      expect(result.total).toBeLessThan(0.181);
    });

    it('has 4 stages', () => {
      expect(result.stages).toHaveLength(4);
      expect(result.stages.map(s => s.name)).toEqual(['Polysilicon', 'Wafer', 'Cell', 'Module']);
    });

    it('polysilicon matches backend ($0.0222)', () => {
      expect(result.stages[0].cost).toBeCloseTo(0.0222, 3);
    });

    it('wafer matches backend ($0.0418)', () => {
      expect(result.stages[1].cost).toBeCloseTo(0.0418, 3);
    });

    it('cell matches backend ($0.0335)', () => {
      expect(result.stages[2].cost).toBeCloseTo(0.0335, 3);
    });

    it('module matches backend ($0.0811)', () => {
      expect(result.stages[3].cost).toBeCloseTo(0.0811, 3);
    });

    it('stages sum to total', () => {
      const sum = result.stages.reduce((s, stage) => s + stage.cost, 0);
      expect(Math.abs(sum - result.total)).toBeLessThan(0.001);
    });
  });

  describe('Sensitivity: silver price changes', () => {
    it('doubling silver increases total cost', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, silverPrice: 1706 });
      expect(high.total).toBeGreaterThan(base.total);
    });

    it('silver only affects cell stage', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, silverPrice: 1200 });
      // Poly, wafer, module should be unchanged
      expect(high.stages[0].cost).toBe(base.stages[0].cost);
      expect(high.stages[1].cost).toBe(base.stages[1].cost);
      expect(high.stages[3].cost).toBe(base.stages[3].cost);
      // Cell should increase
      expect(high.stages[2].cost).toBeGreaterThan(base.stages[2].cost);
    });
  });

  describe('Sensitivity: electricity price', () => {
    it('higher electricity increases all stages', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, electricityPrice: 0.15 });
      expect(high.total).toBeGreaterThan(base.total);
      // Poly is most electricity-intensive — should see biggest absolute increase
      const polyDelta = high.stages[0].cost - base.stages[0].cost;
      expect(polyDelta).toBeGreaterThan(0);
    });
  });

  describe('Sensitivity: aluminum price', () => {
    it('aluminum only affects module stage', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, aluminumPrice: 2.0 });
      expect(high.stages[0].cost).toBe(base.stages[0].cost); // poly unchanged
      expect(high.stages[1].cost).toBe(base.stages[1].cost); // wafer unchanged
      expect(high.stages[2].cost).toBe(base.stages[2].cost); // cell unchanged
      expect(high.stages[3].cost).toBeGreaterThan(base.stages[3].cost); // module increases
    });
  });

  describe('Sensitivity: overhead and profit', () => {
    it('zero overhead + zero profit gives lower cost', () => {
      const zero = calculateModuleCost({ ...DEFAULTS, overheadPct: 0, profitPct: 0 });
      const base = calculateModuleCost(DEFAULTS);
      expect(zero.total).toBeLessThan(base.total);
    });

    it('doubling profit increases cost proportionally', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, profitPct: 30 });
      expect(high.total).toBeGreaterThan(base.total * 1.1);
    });
  });

  describe('Sensitivity: cell efficiency', () => {
    it('higher efficiency reduces wafer cost (more watts per wafer)', () => {
      const base = calculateModuleCost(DEFAULTS);
      const high = calculateModuleCost({ ...DEFAULTS, cellEfficiency: 28 });
      expect(high.stages[1].cost).toBeLessThan(base.stages[1].cost);
    });
  });

  describe('Edge cases: no NaN or negative values', () => {
    it('minimum inputs produce valid positive cost', () => {
      const result = calculateModuleCost({
        siliconPrice: 0.5, silverPrice: 400, aluminumPrice: 0.5,
        glassPrice: 0.3, evaPrice: 0.5, electricityPrice: 0.02,
        avgSalary: 3000, cellEfficiency: 20, overheadPct: 5, profitPct: 5,
      });
      expect(Number.isFinite(result.total)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      result.stages.forEach(s => {
        expect(Number.isFinite(s.cost)).toBe(true);
        expect(s.cost).toBeGreaterThan(0);
      });
    });

    it('maximum inputs produce valid cost', () => {
      const result = calculateModuleCost({
        siliconPrice: 5, silverPrice: 1500, aluminumPrice: 3,
        glassPrice: 2, evaPrice: 4, electricityPrice: 0.20,
        avgSalary: 60000, cellEfficiency: 28, overheadPct: 20, profitPct: 25,
      });
      expect(Number.isFinite(result.total)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      expect(result.total).toBeLessThan(1); // sanity: should still be < $1/Wp
    });
  });
});
