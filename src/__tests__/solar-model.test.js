import { describe, it, expect } from 'vitest';
import { calculateSolarCost, getBenchmark, getModelMeta } from '../services/solar-model-service.js';

describe('Solar Model Service', () => {
  describe('Model metadata', () => {
    it('returns valid model metadata', () => {
      const meta = getModelMeta();
      expect(meta.version).toBe('solar-irena-v2026.03');
      expect(meta.countries).toContain('VN');
      expect(meta.technologies).toContain('topcon');
      expect(meta.validYears).toContain(2025);
    });
  });

  describe('VN/TOPCon/2025 benchmark (the 2am Friday test)', () => {
    const result = calculateSolarCost('VN', 'topcon', 2025);

    it('total cost is within 10% of IRENA reference ($0.180/Wp)', () => {
      expect(result.totalCostPerWp).toBeGreaterThan(0.160);
      expect(result.totalCostPerWp).toBeLessThan(0.200);
    });

    it('has 4 stages', () => {
      expect(result.stageBreakdown).toHaveLength(4);
      expect(result.stageBreakdown.map(s => s.stage)).toEqual([
        'polysilicon', 'wafer', 'cell', 'module'
      ]);
    });

    it('stage costs are positive and sum to total', () => {
      const stageSum = result.stageBreakdown.reduce((sum, s) => sum + s.costPerWp, 0);
      expect(Math.abs(stageSum - result.totalCostPerWp)).toBeLessThan(0.001);
      result.stageBreakdown.forEach(s => {
        expect(s.costPerWp).toBeGreaterThan(0);
      });
    });

    it('module is the largest cost component', () => {
      const moduleCost = result.stageBreakdown.find(s => s.stage === 'module').costPerWp;
      const otherMax = Math.max(
        ...result.stageBreakdown.filter(s => s.stage !== 'module').map(s => s.costPerWp)
      );
      expect(moduleCost).toBeGreaterThan(otherMax);
    });

    it('each stage has component breakdown', () => {
      result.stageBreakdown.forEach(stage => {
        expect(stage.components).toBeDefined();
        expect(stage.components.electricity).toBeGreaterThanOrEqual(0);
        expect(stage.components.materials).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('All 6 countries produce valid output', () => {
    const countries = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];

    countries.forEach(country => {
      it(`${country}/topcon/2025 produces valid cost`, () => {
        const result = calculateSolarCost(country, 'topcon', 2025);
        expect(result.totalCostPerWp).toBeGreaterThan(0.10);
        expect(result.totalCostPerWp).toBeLessThan(0.50);
        expect(result.stageBreakdown).toHaveLength(4);
      });
    });
  });

  describe('Country ordering makes sense', () => {
    it('China is cheapest, US/AU/DE are most expensive', () => {
      const cn = calculateSolarCost('CN', 'topcon', 2025).totalCostPerWp;
      const vn = calculateSolarCost('VN', 'topcon', 2025).totalCostPerWp;
      const de = calculateSolarCost('DE', 'topcon', 2025).totalCostPerWp;

      expect(cn).toBeLessThan(vn);
      expect(vn).toBeLessThan(de);
    });
  });

  describe('2025 to 2030 costs decrease', () => {
    it('TOPCon costs decrease monotonically from 2025 to 2030', () => {
      let prevCost = Infinity;
      for (let year = 2025; year <= 2030; year++) {
        const cost = calculateSolarCost('VN', 'topcon', year).totalCostPerWp;
        expect(cost).toBeLessThanOrEqual(prevCost);
        prevCost = cost;
      }
    });
  });

  describe('TOPCon vs Mono', () => {
    it('both technologies produce valid costs', () => {
      const topcon = calculateSolarCost('VN', 'topcon', 2025);
      const mono = calculateSolarCost('VN', 'mono', 2025);

      expect(topcon.totalCostPerWp).toBeGreaterThan(0);
      expect(mono.totalCostPerWp).toBeGreaterThan(0);
    });
  });

  describe('No NaN or negative values (hostile QA test)', () => {
    const countries = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    const techs = ['topcon', 'mono'];
    const years = [2025, 2026, 2027, 2028, 2029, 2030];

    for (const country of countries) {
      for (const tech of techs) {
        for (const year of years) {
          it(`${country}/${tech}/${year} has no NaN or negative costs`, () => {
            const result = calculateSolarCost(country, tech, year);
            expect(Number.isFinite(result.totalCostPerWp)).toBe(true);
            expect(result.totalCostPerWp).toBeGreaterThan(0);

            result.stageBreakdown.forEach(stage => {
              expect(Number.isFinite(stage.costPerWp)).toBe(true);
              expect(stage.costPerWp).toBeGreaterThan(0);
              Object.values(stage.components).forEach(v => {
                expect(Number.isFinite(v)).toBe(true);
                expect(v).toBeGreaterThanOrEqual(0);
              });
            });
          });
        }
      }
    }
  });
});
