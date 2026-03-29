import { describe, it, expect } from 'vitest';
import { calculateWindCost, getWindBenchmark, getWindModelMeta } from '../services/wind-cost-engine.js';

describe('Wind Cost Engine', () => {
  describe('Model metadata', () => {
    it('returns valid model metadata', () => {
      const meta = getWindModelMeta();
      expect(meta.version).toBe('wind-irena-v2026');
      expect(meta.turbineTypes).toContain('onshore');
      expect(meta.validYears).toContain(2025);
      expect(meta.referenceCapacityMW).toBe(3);
    });
  });

  describe('Onshore/2025 benchmark', () => {
    const result = calculateWindCost('onshore', 2025);

    it('total cost is within 15% of IRENA reference ($1200/kW)', () => {
      const benchmark = getWindBenchmark('onshore', 2025);
      expect(benchmark).not.toBeNull();
      expect(result.totalCostPerKw).toBeGreaterThan(benchmark.totalPerKw * 0.85);
      expect(result.totalCostPerKw).toBeLessThan(benchmark.totalPerKw * 1.15);
    });

    it('has 5 stages', () => {
      expect(result.stageBreakdown).toHaveLength(5);
      expect(result.stageBreakdown.map(s => s.stage)).toEqual([
        'blade', 'nacelle', 'tower', 'electrical', 'installation'
      ]);
    });

    it('stage costs are positive and sum to total', () => {
      const stageSum = result.stageBreakdown.reduce((sum, s) => sum + s.costPerKw, 0);
      expect(Math.abs(stageSum - result.totalCostPerKw)).toBeLessThan(1);
      result.stageBreakdown.forEach(s => {
        expect(s.costPerKw).toBeGreaterThan(0);
      });
    });

    it('tower is the largest cost component (steel dominates)', () => {
      const towerCost = result.stageBreakdown.find(s => s.stage === 'tower').costPerKw;
      const otherMax = Math.max(
        ...result.stageBreakdown.filter(s => s.stage !== 'tower').map(s => s.costPerKw)
      );
      expect(towerCost).toBeGreaterThan(otherMax);
    });

    it('each stage has component breakdown', () => {
      result.stageBreakdown.forEach(stage => {
        expect(stage.components).toBeDefined();
        const componentSum = Object.values(stage.components).reduce((a, b) => a + b, 0);
        expect(Math.abs(componentSum - stage.costPerKw)).toBeLessThan(1);
      });
    });

    it('returns correct model metadata', () => {
      expect(result.model.version).toBe('wind-irena-v2026');
      expect(result.model.turbineType).toBe('onshore');
      expect(result.model.year).toBe(2025);
      expect(result.model.referenceCapacityMW).toBe(3);
    });

    it('unit is $/kW', () => {
      expect(result.unit).toBe('$/kW');
    });
  });

  describe('2025 to 2030 costs decrease', () => {
    it('costs decrease monotonically from 2025 to 2030', () => {
      let prevCost = Infinity;
      for (let year = 2025; year <= 2030; year++) {
        const cost = calculateWindCost('onshore', year).totalCostPerKw;
        expect(cost).toBeLessThanOrEqual(prevCost);
        prevCost = cost;
      }
    });

    it('2030 is ~10% cheaper than 2025', () => {
      const cost2025 = calculateWindCost('onshore', 2025).totalCostPerKw;
      const cost2030 = calculateWindCost('onshore', 2030).totalCostPerKw;
      const reduction = (cost2025 - cost2030) / cost2025;
      expect(reduction).toBeGreaterThan(0.08);
      expect(reduction).toBeLessThan(0.12);
    });
  });

  describe('Validation', () => {
    it('rejects invalid turbine type', () => {
      expect(() => calculateWindCost('offshore', 2025)).toThrow(RangeError);
    });

    it('rejects year below 2025', () => {
      expect(() => calculateWindCost('onshore', 2020)).toThrow(RangeError);
    });

    it('rejects year above 2030', () => {
      expect(() => calculateWindCost('onshore', 2035)).toThrow(RangeError);
    });
  });

  describe('No NaN or negative values', () => {
    const years = [2025, 2026, 2027, 2028, 2029, 2030];
    for (const year of years) {
      it(`onshore/${year} has no NaN or negative costs`, () => {
        const result = calculateWindCost('onshore', year);
        expect(Number.isFinite(result.totalCostPerKw)).toBe(true);
        expect(result.totalCostPerKw).toBeGreaterThan(0);

        result.stageBreakdown.forEach(stage => {
          expect(Number.isFinite(stage.costPerKw)).toBe(true);
          expect(stage.costPerKw).toBeGreaterThan(0);
          Object.values(stage.components).forEach(v => {
            expect(Number.isFinite(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(0);
          });
        });
      });
    }
  });
});
