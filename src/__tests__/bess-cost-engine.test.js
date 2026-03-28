import { describe, it, expect } from 'vitest';
import { calculateBessCost, getBessBenchmark, getBessModelMeta } from '../services/bess-cost-engine.js';

describe('BESS Cost Engine', () => {
  describe('Model metadata', () => {
    it('returns valid metadata', () => {
      const meta = getBessModelMeta();
      expect(meta.version).toBe('bess-argonne-v2024');
      expect(meta.chemistries).toContain('lfp');
      expect(meta.chemistries).toContain('nmc811');
      expect(meta.provenanceNote).toContain('Bottom-up');
    });
  });

  describe('LFP/2025 benchmark', () => {
    const result = calculateBessCost('lfp', 2025);
    const benchmark = getBessBenchmark('lfp', 2025);

    it('total pack cost near benchmark ($68/kWh ±10%)', () => {
      expect(result.totalCostPerKwh).toBeGreaterThan(benchmark.packTotal * 0.9);
      expect(result.totalCostPerKwh).toBeLessThan(benchmark.packTotal * 1.1);
    });

    it('has 5 stages', () => {
      expect(result.stageBreakdown).toHaveLength(5);
      expect(result.stageBreakdown.map(s => s.stage)).toEqual([
        'cathode', 'anode', 'cellComponents', 'cellAssembly', 'pack',
      ]);
    });

    it('stages sum to total', () => {
      const sum = result.stageBreakdown.reduce((s, stage) => s + stage.costPerKwh, 0);
      expect(Math.abs(sum - result.totalCostPerKwh)).toBeLessThan(1);
    });

    it('cell cost (stages 1-4) near cell benchmark ($43/kWh ±10%)', () => {
      const cellCost = result.stageBreakdown
        .filter(s => s.stage !== 'pack')
        .reduce((s, stage) => s + stage.costPerKwh, 0);
      expect(cellCost).toBeGreaterThan(benchmark.cellTotal * 0.9);
      expect(cellCost).toBeLessThan(benchmark.cellTotal * 1.1);
    });

    it('pack stage is $25/kWh', () => {
      const packStage = result.stageBreakdown.find(s => s.stage === 'pack');
      expect(packStage.costPerKwh).toBe(25);
    });

    it('pack is the largest cost stage for LFP (pack overhead dominates cheap cells)', () => {
      const packStage = result.stageBreakdown.find(s => s.stage === 'pack');
      const cellStages = result.stageBreakdown.filter(s => s.stage !== 'pack');
      const maxCellStage = Math.max(...cellStages.map(s => s.costPerKwh));
      expect(packStage.costPerKwh).toBeGreaterThanOrEqual(maxCellStage);
    });
  });

  describe('NMC811/2025 benchmark', () => {
    const result = calculateBessCost('nmc811', 2025);
    const benchmark = getBessBenchmark('nmc811', 2025);

    it('total pack cost near benchmark ($92/kWh ±10%)', () => {
      expect(result.totalCostPerKwh).toBeGreaterThan(benchmark.packTotal * 0.9);
      expect(result.totalCostPerKwh).toBeLessThan(benchmark.packTotal * 1.1);
    });

    it('cell cost near cell benchmark ($67/kWh ±10%)', () => {
      const cellCost = result.stageBreakdown
        .filter(s => s.stage !== 'pack')
        .reduce((s, stage) => s + stage.costPerKwh, 0);
      expect(cellCost).toBeGreaterThan(benchmark.cellTotal * 0.9);
      expect(cellCost).toBeLessThan(benchmark.cellTotal * 1.1);
    });
  });

  describe('LFP is cheaper than NMC811', () => {
    it('at cell level', () => {
      const lfp = calculateBessCost('lfp', 2025);
      const nmc = calculateBessCost('nmc811', 2025);
      const lfpCell = lfp.stageBreakdown.filter(s => s.stage !== 'pack').reduce((s, st) => s + st.costPerKwh, 0);
      const nmcCell = nmc.stageBreakdown.filter(s => s.stage !== 'pack').reduce((s, st) => s + st.costPerKwh, 0);
      expect(lfpCell).toBeLessThan(nmcCell);
    });

    it('cathode is the main cost difference', () => {
      const lfp = calculateBessCost('lfp', 2025);
      const nmc = calculateBessCost('nmc811', 2025);
      const lfpCathode = lfp.stageBreakdown.find(s => s.stage === 'cathode').costPerKwh;
      const nmcCathode = nmc.stageBreakdown.find(s => s.stage === 'cathode').costPerKwh;
      expect(nmcCathode).toBeGreaterThan(lfpCathode * 1.5); // NMC cathode significantly more expensive
    });
  });

  describe('Cost decreases over time', () => {
    it('LFP 2025 > LFP 2030', () => {
      const c25 = calculateBessCost('lfp', 2025).totalCostPerKwh;
      const c30 = calculateBessCost('lfp', 2030).totalCostPerKwh;
      expect(c30).toBeLessThan(c25);
    });

    it('NMC811 2025 > NMC811 2035', () => {
      const c25 = calculateBessCost('nmc811', 2025).totalCostPerKwh;
      const c35 = calculateBessCost('nmc811', 2035).totalCostPerKwh;
      expect(c35).toBeLessThan(c25);
    });
  });

  describe('No NaN, negative, or Infinity', () => {
    for (const chem of ['lfp', 'nmc811']) {
      for (const year of [2025, 2026, 2028, 2030, 2035]) {
        it(`${chem}/${year} has valid costs`, () => {
          const result = calculateBessCost(chem, year);
          expect(Number.isFinite(result.totalCostPerKwh)).toBe(true);
          expect(result.totalCostPerKwh).toBeGreaterThan(0);
          result.stageBreakdown.forEach(s => {
            expect(Number.isFinite(s.costPerKwh)).toBe(true);
            expect(s.costPerKwh).toBeGreaterThan(0);
            Object.values(s.components).forEach(v => {
              expect(Number.isFinite(v)).toBe(true);
              expect(v).toBeGreaterThanOrEqual(0);
            });
          });
        });
      }
    }
  });

  describe('Invalid inputs', () => {
    it('unknown chemistry throws', () => {
      expect(() => calculateBessCost('sodium', 2025)).toThrow('Unknown chemistry');
    });
  });

  describe('Model output shape', () => {
    it('includes costing method in model metadata', () => {
      const result = calculateBessCost('lfp', 2025);
      expect(result.model.costingMethod).toBe('batpac_native');
      expect(result.model.version).toBe('bess-argonne-v2024');
    });

    it('each stage has components breakdown', () => {
      const result = calculateBessCost('lfp', 2025);
      result.stageBreakdown.forEach(s => {
        expect(s.components).toBeDefined();
        expect(Object.keys(s.components).length).toBeGreaterThan(0);
      });
    });
  });
});
