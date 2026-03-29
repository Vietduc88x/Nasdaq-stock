import { describe, it, expect } from 'vitest';
import { calculateLandedCost, calculateAllRoutes, getAvailableRoutes, getLandedCostMeta } from '../services/landed-cost-engine.js';

describe('Landed Cost Engine', () => {
  describe('Model metadata', () => {
    it('returns valid metadata', () => {
      const meta = getLandedCostMeta();
      expect(meta.version).toBe('landed-cost-v2026.03');
      expect(meta.supportedProducts).toContain('module');
      expect(meta.supportedProducts).toContain('cell');
      expect(meta.supportedProducts).toContain('wafer');
      expect(meta.productHsCodes.module).toBe('8541.43');
      expect(meta.productHsCodes.cell).toBe('8541.42');
      expect(meta.productHsCodes.wafer).toBe('8541.49');
      expect(meta.routeCount).toBeGreaterThanOrEqual(6);
    });

    it('lists available routes', () => {
      const routes = getAvailableRoutes();
      expect(routes.length).toBeGreaterThanOrEqual(6);
      expect(routes.find(r => r.from === 'CN' && r.to === 'VN')).toBeDefined();
      expect(routes.find(r => r.from === 'VN' && r.to === 'US')).toBeDefined();
    });
  });

  describe('Cost chain ordering: DDP > CIF > FOB > EXW', () => {
    const routes = [
      { from: 'CN', to: 'VN' },
      { from: 'CN', to: 'IN' },
      { from: 'CN', to: 'US' },
      { from: 'CN', to: 'DE' },
      { from: 'CN', to: 'AU' },
      { from: 'VN', to: 'US' },
    ];

    routes.forEach(({ from, to }) => {
      it(`${from}→${to}: DDP > CIF > FOB > EXW`, () => {
        const result = calculateLandedCost({ from, to, exw: 0.179 });
        const { exw, fob, cif, ddp } = result.breakdown;
        expect(ddp).toBeGreaterThan(cif);
        expect(cif).toBeGreaterThan(fob);
        expect(fob).toBeGreaterThan(exw);
      });
    });
  });

  describe('Zero-duty routes', () => {
    it('CN→VN has zero customs duty', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'VN', exw: 0.179 });
      expect(result.breakdown.customsDuty).toBe(0);
      expect(result.breakdown.antiDumping).toBe(0);
      expect(result.breakdown.countervailing).toBe(0);
    });

    it('CN→DE has zero customs duty', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'DE', exw: 0.179 });
      expect(result.breakdown.customsDuty).toBe(0);
    });

    it('CN→AU has zero customs duty', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'AU', exw: 0.179 });
      expect(result.breakdown.customsDuty).toBe(0);
    });
  });

  describe('High-duty routes have much larger premium', () => {
    it('CN→US premium >> CN→VN premium', () => {
      const us = calculateLandedCost({ from: 'CN', to: 'US', exw: 0.179 });
      const vn = calculateLandedCost({ from: 'CN', to: 'VN', exw: 0.179 });
      expect(us.summary.ddpPremiumPct).toBeGreaterThan(vn.summary.ddpPremiumPct * 5);
    });

    it('VN→US has highest premium (AD/CVD + reciprocal)', () => {
      const vnUs = calculateLandedCost({ from: 'VN', to: 'US', exw: 0.179 });
      const cnUs = calculateLandedCost({ from: 'CN', to: 'US', exw: 0.179 });
      expect(vnUs.summary.ddpPremiumPct).toBeGreaterThan(cnUs.summary.ddpPremiumPct);
    });
  });

  describe('Waterfall stages', () => {
    it('contains only positive-cost stages', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'VN', exw: 0.179 });
      result.waterfall.forEach(s => {
        expect(s.costPerWp).toBeGreaterThan(0);
        expect(s.stage).toBeTruthy();
      });
      // Zero-duty route should NOT have customs/AD/CVD stages
      expect(result.waterfall.find(s => s.stage === 'Customs Duty')).toBeUndefined();
    });

    it('includes customs stages for high-duty routes', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'US', exw: 0.179 });
      expect(result.waterfall.find(s => s.stage === 'Customs Duty')).toBeDefined();
    });
  });

  describe('Model provenance', () => {
    it('returns route-specific provenance', () => {
      const result = calculateLandedCost({ from: 'CN', to: 'VN', exw: 0.179 });
      expect(result.model.hsCode).toBe('8541.43');
      expect(result.model.confidence).toBe('high');
      expect(result.model.notes).toContain('ACFTA');
      expect(result.model.transitDays).toHaveProperty('min');
      expect(result.model.transitDays).toHaveProperty('max');
    });
  });

  describe('Validation', () => {
    it('rejects unsupported route', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'BR', exw: 0.179 })).toThrow(RangeError);
    });

    it('rejects unsupported product', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'VN', product: 'inverter', exw: 0.179 })).toThrow(RangeError);
    });

    it('rejects zero EXW', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'VN', exw: 0 })).toThrow(RangeError);
    });

    it('rejects negative EXW', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'VN', exw: -0.1 })).toThrow(RangeError);
    });

    it('rejects absurdly high EXW', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'VN', exw: 10 })).toThrow(RangeError);
    });

    it('rejects non-numeric EXW', () => {
      expect(() => calculateLandedCost({ from: 'CN', to: 'VN', exw: 'abc' })).toThrow(RangeError);
    });
  });

  describe('No NaN or negative values', () => {
    const routes = [
      { from: 'CN', to: 'VN' }, { from: 'CN', to: 'IN' }, { from: 'CN', to: 'US' },
      { from: 'CN', to: 'DE' }, { from: 'CN', to: 'AU' }, { from: 'VN', to: 'US' },
    ];
    const exws = [0.10, 0.179, 0.25, 0.50, 1.00];

    for (const { from, to } of routes) {
      for (const exw of exws) {
        it(`${from}→${to} @ $${exw}/Wp has no NaN or negative`, () => {
          const result = calculateLandedCost({ from, to, exw });
          const bd = result.breakdown;
          for (const [key, val] of Object.entries(bd)) {
            expect(Number.isFinite(val)).toBe(true);
            expect(val).toBeGreaterThanOrEqual(0);
          }
          expect(result.summary.ddpPremiumPct).toBeGreaterThan(0);
        });
      }
    }
  });

  describe('Comparison mode', () => {
    it('returns all routes sorted by DDP ascending', () => {
      const results = calculateAllRoutes(0.179);
      expect(results.length).toBe(6);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].ddp).toBeGreaterThanOrEqual(results[i - 1].ddp);
      }
    });

    it('comparison entries have correct shape', () => {
      const results = calculateAllRoutes(0.179);
      for (const r of results) {
        expect(r).toHaveProperty('from');
        expect(r).toHaveProperty('to');
        expect(r).toHaveProperty('label');
        expect(r).toHaveProperty('fob');
        expect(r).toHaveProperty('cif');
        expect(r).toHaveProperty('ddp');
        expect(r).toHaveProperty('premiumPct');
        expect(r).toHaveProperty('transitDays');
      }
    });
  });
});
