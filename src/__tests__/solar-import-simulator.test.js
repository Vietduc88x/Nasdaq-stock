import { describe, it, expect } from 'vitest';
import { calculateSolarImportScenario, calculateSolarImportComparison } from '../services/solar-import-simulator.js';
import { calculateSolarCost } from '../services/solar-model-service.js';
import { calculateLandedCost } from '../services/landed-cost-engine.js';

const DEST = 'VN';
const SOURCE = 'CN';
const TECH = 'topcon';
const YEAR = 2025;

// Pre-compute reference values for formula verification
const destCost = calculateSolarCost(DEST, TECH, YEAR);
const sourceCost = calculateSolarCost(SOURCE, TECH, YEAR);
const destStages = {};
const sourceStages = {};
for (const s of destCost.stageBreakdown) destStages[s.stage] = s.costPerWp;
for (const s of sourceCost.stageBreakdown) sourceStages[s.stage] = s.costPerWp;

const round5 = n => Math.round(n * 100000) / 100000;

describe('Solar Import Simulator', () => {
  describe('Formula verification — cumulative EXW', () => {
    it('wafer export EXW = cnPoly + cnWafer', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'wafer_import' });
      const expected = round5(sourceStages.polysilicon + sourceStages.wafer);
      expect(result.tradeAdders.exportExw).toBe(expected);
    });

    it('cell export EXW = cnPoly + cnWafer + cnCell', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'cell_import' });
      const expected = round5(sourceStages.polysilicon + sourceStages.wafer + sourceStages.cell);
      expect(result.tradeAdders.exportExw).toBe(expected);
    });

    it('module export EXW = cnPoly + cnWafer + cnCell + cnModule', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'module_import' });
      const expected = round5(sourceStages.polysilicon + sourceStages.wafer + sourceStages.cell + sourceStages.module);
      expect(result.tradeAdders.exportExw).toBe(expected);
    });
  });

  describe('Formula verification — scenario totals', () => {
    it('domestic === solarDest.totalCostPerWp', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'domestic' });
      expect(result.totalCostPerWp).toBe(destCost.totalCostPerWp);
    });

    it('wafer_import === landed(waferExw).ddp + destCell + destModule', () => {
      const waferExw = round5(sourceStages.polysilicon + sourceStages.wafer);
      const landed = calculateLandedCost({ from: SOURCE, to: DEST, product: 'wafer', exw: waferExw });
      const expected = round5(landed.breakdown.ddp + destStages.cell + destStages.module);
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'wafer_import' });
      expect(result.totalCostPerWp).toBe(expected);
    });

    it('cell_import === landed(cellExw).ddp + destModule', () => {
      const cellExw = round5(sourceStages.polysilicon + sourceStages.wafer + sourceStages.cell);
      const landed = calculateLandedCost({ from: SOURCE, to: DEST, product: 'cell', exw: cellExw });
      const expected = round5(landed.breakdown.ddp + destStages.module);
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'cell_import' });
      expect(result.totalCostPerWp).toBe(expected);
    });

    it('module_import === landed(moduleExw).ddp', () => {
      const moduleExw = round5(sourceStages.polysilicon + sourceStages.wafer + sourceStages.cell + sourceStages.module);
      const landed = calculateLandedCost({ from: SOURCE, to: DEST, product: 'module', exw: moduleExw });
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'module_import' });
      expect(result.totalCostPerWp).toBe(round5(landed.breakdown.ddp));
    });
  });

  describe('Delta formulas', () => {
    it('deltaVsDomestic = scenarioCost - domestic', () => {
      const comparison = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });
      const domestic = comparison.baseline.totalCostPerWp;

      for (const s of comparison.scenarios) {
        expect(s.deltaVsDomestic).toBe(round5(s.totalCostPerWp - domestic));
      }
    });

    it('domestic delta is zero', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'domestic' });
      expect(result.deltaVsDomestic).toBe(0);
    });
  });

  describe('Expected v1 behavior for VN/CN', () => {
    const comparison = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });

    it('cell_import is cheaper than domestic (IRENA reference shows -31%)', () => {
      const cell = comparison.scenarios.find(s => s.scenario === 'cell_import');
      expect(cell.deltaVsDomestic).toBeLessThan(0);
    });

    it('wafer_import is cheaper than domestic', () => {
      const wafer = comparison.scenarios.find(s => s.scenario === 'wafer_import');
      expect(wafer.deltaVsDomestic).toBeLessThan(0);
    });

    it('cell_import is cheaper than wafer_import', () => {
      const wafer = comparison.scenarios.find(s => s.scenario === 'wafer_import');
      const cell = comparison.scenarios.find(s => s.scenario === 'cell_import');
      expect(cell.totalCostPerWp).toBeLessThan(wafer.totalCostPerWp);
    });
  });

  describe('Trade adders decomposition', () => {
    it('tradeAdder = ddp - exportExw', () => {
      const scenarios = ['wafer_import', 'cell_import', 'module_import'];
      for (const scenario of scenarios) {
        const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario });
        expect(result.tradeAdders.tradeAdder).toBe(
          round5(result.tradeAdders.ddp - result.tradeAdders.exportExw)
        );
      }
    });

    it('ddp > cif > fob > exportExw for all import scenarios', () => {
      const scenarios = ['wafer_import', 'cell_import', 'module_import'];
      for (const scenario of scenarios) {
        const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario });
        const ta = result.tradeAdders;
        expect(ta.ddp).toBeGreaterThan(ta.cif);
        expect(ta.cif).toBeGreaterThan(ta.fob);
        expect(ta.fob).toBeGreaterThan(ta.exportExw);
      }
    });
  });

  describe('Comparison response shape', () => {
    it('returns all 4 scenarios', () => {
      const comparison = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });
      expect(comparison.scenarios).toHaveLength(4);
      expect(comparison.scenarios.map(s => s.scenario)).toEqual([
        'domestic', 'wafer_import', 'cell_import', 'module_import'
      ]);
    });

    it('includes both model versions', () => {
      const comparison = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });
      expect(comparison.model.solarModelVersion).toMatch(/^solar-irena/);
      expect(comparison.model.tradeModelVersion).toMatch(/^landed-cost/);
    });

    it('each import scenario has mainDriver', () => {
      const comparison = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });
      for (const s of comparison.scenarios) {
        if (s.scenario === 'domestic') {
          expect(s.mainDriver).toBeNull();
        } else {
          expect(['Lower upstream manufacturing cost', 'Tariff and freight burden']).toContain(s.mainDriver);
        }
      }
    });
  });

  describe('Validation', () => {
    it('rejects invalid scenario', () => {
      expect(() => calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'invalid' })).toThrow(RangeError);
    });
  });

  describe('Stage breakdown shape', () => {
    it('domestic has 4 local stages', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'domestic' });
      expect(result.stageBreakdown).toHaveLength(4);
      expect(result.stageBreakdown.every(s => s.stage.includes('local'))).toBe(true);
    });

    it('wafer_import has 3 stages (imported wafer + 2 local)', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'wafer_import' });
      expect(result.stageBreakdown).toHaveLength(3);
      expect(result.stageBreakdown[0].stage).toContain('Imported');
    });

    it('cell_import has 2 stages (imported cell + 1 local)', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'cell_import' });
      expect(result.stageBreakdown).toHaveLength(2);
    });

    it('module_import has 1 stage (imported module only)', () => {
      const result = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'module_import' });
      expect(result.stageBreakdown).toHaveLength(1);
    });
  });

  describe('Policy regime support', () => {
    it('current regime matches default exactly', () => {
      const withoutRegime = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR });
      const withRegime = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, regime: 'current' });
      for (let i = 0; i < withoutRegime.scenarios.length; i++) {
        expect(withoutRegime.scenarios[i].totalCostPerWp).toBe(withRegime.scenarios[i].totalCostPerWp);
      }
    });

    it('params include regime', () => {
      const result = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, regime: 'escalation_case' });
      expect(result.params.regime).toBe('escalation_case');
    });

    it('ranking includes cheapestScenario and rankingChanged', () => {
      const result = calculateSolarImportComparison({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, regime: 'current' });
      expect(result.ranking).toHaveProperty('cheapestScenario');
      expect(result.ranking).toHaveProperty('previousCheapestScenario');
      expect(result.ranking).toHaveProperty('rankingChanged');
      expect(result.ranking.rankingChanged).toBe(false);
    });

    it('domestic scenario unaffected by regime (no trade component)', () => {
      const current = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'domestic', regime: 'current' });
      const escalation = calculateSolarImportScenario({ dest: DEST, source: SOURCE, tech: TECH, year: YEAR, scenario: 'domestic', regime: 'escalation_case' });
      expect(current.totalCostPerWp).toBe(escalation.totalCostPerWp);
    });

    it('CN→US route: escalation raises import scenario costs', () => {
      // Use US as dest to test tariff impact on import scenarios
      const current = calculateSolarImportComparison({ dest: 'US', source: 'CN', tech: TECH, year: YEAR, regime: 'current' });
      const escalation = calculateSolarImportComparison({ dest: 'US', source: 'CN', tech: TECH, year: YEAR, regime: 'escalation_case' });

      const currentModule = current.scenarios.find(s => s.scenario === 'module_import');
      const escalationModule = escalation.scenarios.find(s => s.scenario === 'module_import');
      expect(escalationModule.totalCostPerWp).toBeGreaterThan(currentModule.totalCostPerWp);
    });
  });
});
