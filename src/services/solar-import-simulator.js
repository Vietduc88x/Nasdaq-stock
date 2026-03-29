/**
 * Solar Import Stage Simulator
 *
 * Compares sourcing strategies for solar PV manufacturing:
 *   domestic     — full local supply chain
 *   wafer_import — import landed wafers, local cell + module
 *   cell_import  — import landed cells, local module only
 *   module_import— import landed finished modules
 *
 *  SCENARIO FORMULAS:
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  domestic     = destPoly + destWafer + destCell + destModule       │
 *  │  wafer_import = landed(cnPoly+cnWafer, 'wafer').ddp               │
 *  │                 + destCell + destModule                            │
 *  │  cell_import  = landed(cnPoly+cnWafer+cnCell, 'cell').ddp         │
 *  │                 + destModule                                       │
 *  │  module_import= landed(cnPoly+cnWafer+cnCell+cnModule, 'module').ddp│
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 *  Imported stage cost = cumulative upstream EXW + trade adders (freight, duty, etc.)
 */

import { calculateSolarCost } from './solar-model-service.js';
import { calculateLandedCost } from './landed-cost-engine.js';

const VALID_SCENARIOS = ['domestic', 'wafer_import', 'cell_import', 'module_import'];
const SCENARIO_LABELS = {
  domestic: 'Full Domestic',
  wafer_import: 'Import Wafers',
  cell_import: 'Import Cells',
  module_import: 'Import Modules',
};

/**
 * Extract stage costs into a flat map: { polysilicon, wafer, cell, module }
 */
function getSolarStageMap(costResult) {
  const map = {};
  for (const stage of costResult.stageBreakdown) {
    map[stage.stage] = stage.costPerWp;
  }
  return map;
}

/**
 * Compute cumulative EXW for an export product.
 * Wafer = poly + wafer. Cell = poly + wafer + cell. Module = all 4.
 */
function getCumulativeExportExw(stageMap, product) {
  switch (product) {
    case 'wafer': return stageMap.polysilicon + stageMap.wafer;
    case 'cell': return stageMap.polysilicon + stageMap.wafer + stageMap.cell;
    case 'module': return stageMap.polysilicon + stageMap.wafer + stageMap.cell + stageMap.module;
    default: throw new Error(`Unknown export product: ${product}`);
  }
}

function round5(n) { return Math.round(n * 100000) / 100000; }
function round4(n) { return Math.round(n * 10000) / 10000; }

/**
 * Build a single scenario result.
 */
function buildScenarioResult({ scenario, label, totalCostPerWp, domestic, stageBreakdown, tradeAdders }) {
  const deltaAbs = round5(totalCostPerWp - domestic);
  const deltaPct = round4((deltaAbs / domestic) * 100);

  return {
    scenario,
    label,
    totalCostPerWp: round5(totalCostPerWp),
    deltaVsDomestic: deltaAbs,
    deltaPct,
    stageBreakdown,
    tradeAdders,
  };
}

/**
 * Calculate a single import scenario.
 */
export function calculateSolarImportScenario({ dest, source, tech, year, scenario }) {
  if (!VALID_SCENARIOS.includes(scenario)) {
    throw new RangeError(`Invalid scenario: ${scenario}. Valid: ${VALID_SCENARIOS.join(', ')}`);
  }

  const destCost = calculateSolarCost(dest, tech, year);
  const destStages = getSolarStageMap(destCost);
  const domestic = destCost.totalCostPerWp;

  if (scenario === 'domestic') {
    return buildScenarioResult({
      scenario: 'domestic',
      label: SCENARIO_LABELS.domestic,
      totalCostPerWp: domestic,
      domestic,
      stageBreakdown: [
        { stage: 'Polysilicon (local)', costPerWp: round5(destStages.polysilicon) },
        { stage: 'Wafer (local)', costPerWp: round5(destStages.wafer) },
        { stage: 'Cell (local)', costPerWp: round5(destStages.cell) },
        { stage: 'Module (local)', costPerWp: round5(destStages.module) },
      ],
      tradeAdders: null,
    });
  }

  // Source country cost breakdown
  const sourceCost = calculateSolarCost(source, tech, year);
  const sourceStages = getSolarStageMap(sourceCost);

  if (scenario === 'wafer_import') {
    const waferExportExw = getCumulativeExportExw(sourceStages, 'wafer');
    const landed = calculateLandedCost({ from: source, to: dest, product: 'wafer', exw: round5(waferExportExw) });
    const total = round5(landed.breakdown.ddp + destStages.cell + destStages.module);

    return buildScenarioResult({
      scenario: 'wafer_import',
      label: SCENARIO_LABELS.wafer_import,
      totalCostPerWp: total,
      domestic,
      stageBreakdown: [
        { stage: 'Imported Wafer (DDP)', costPerWp: round5(landed.breakdown.ddp) },
        { stage: 'Cell (local)', costPerWp: round5(destStages.cell) },
        { stage: 'Module (local)', costPerWp: round5(destStages.module) },
      ],
      tradeAdders: {
        product: 'wafer',
        exportExw: round5(waferExportExw),
        fob: landed.breakdown.fob,
        cif: landed.breakdown.cif,
        ddp: landed.breakdown.ddp,
        tradeAdder: round5(landed.breakdown.ddp - waferExportExw),
      },
    });
  }

  if (scenario === 'cell_import') {
    const cellExportExw = getCumulativeExportExw(sourceStages, 'cell');
    const landed = calculateLandedCost({ from: source, to: dest, product: 'cell', exw: round5(cellExportExw) });
    const total = round5(landed.breakdown.ddp + destStages.module);

    return buildScenarioResult({
      scenario: 'cell_import',
      label: SCENARIO_LABELS.cell_import,
      totalCostPerWp: total,
      domestic,
      stageBreakdown: [
        { stage: 'Imported Cell (DDP)', costPerWp: round5(landed.breakdown.ddp) },
        { stage: 'Module (local)', costPerWp: round5(destStages.module) },
      ],
      tradeAdders: {
        product: 'cell',
        exportExw: round5(cellExportExw),
        fob: landed.breakdown.fob,
        cif: landed.breakdown.cif,
        ddp: landed.breakdown.ddp,
        tradeAdder: round5(landed.breakdown.ddp - cellExportExw),
      },
    });
  }

  if (scenario === 'module_import') {
    const moduleExportExw = getCumulativeExportExw(sourceStages, 'module');
    const landed = calculateLandedCost({ from: source, to: dest, product: 'module', exw: round5(moduleExportExw) });

    return buildScenarioResult({
      scenario: 'module_import',
      label: SCENARIO_LABELS.module_import,
      totalCostPerWp: landed.breakdown.ddp,
      domestic,
      stageBreakdown: [
        { stage: 'Imported Module (DDP)', costPerWp: round5(landed.breakdown.ddp) },
      ],
      tradeAdders: {
        product: 'module',
        exportExw: round5(moduleExportExw),
        fob: landed.breakdown.fob,
        cif: landed.breakdown.cif,
        ddp: landed.breakdown.ddp,
        tradeAdder: round5(landed.breakdown.ddp - moduleExportExw),
      },
    });
  }
}

/**
 * Calculate all import scenarios for comparison.
 */
export function calculateSolarImportComparison({ dest, source, tech, year }) {
  const destCost = calculateSolarCost(dest, tech, year);
  const sourceCost = calculateSolarCost(source, tech, year);

  const scenarios = VALID_SCENARIOS.map(scenario =>
    calculateSolarImportScenario({ dest, source, tech, year, scenario })
  );

  // Best-driver analysis for each import scenario
  const sourceStages = getSolarStageMap(sourceCost);
  const destStages = getSolarStageMap(destCost);

  for (const s of scenarios) {
    if (s.scenario === 'domestic' || !s.tradeAdders) {
      s.mainDriver = null;
      continue;
    }

    // Manufacturing delta = how much cheaper is the imported product at EXW vs local equivalent
    let equivalentLocalUpstream;
    switch (s.tradeAdders.product) {
      case 'wafer': equivalentLocalUpstream = destStages.polysilicon + destStages.wafer; break;
      case 'cell': equivalentLocalUpstream = destStages.polysilicon + destStages.wafer + destStages.cell; break;
      case 'module': equivalentLocalUpstream = destCost.totalCostPerWp; break;
    }

    const manufacturingDelta = round5(s.tradeAdders.exportExw - equivalentLocalUpstream);
    const tradeBurden = s.tradeAdders.tradeAdder;

    s.mainDriver = Math.abs(manufacturingDelta) > Math.abs(tradeBurden)
      ? 'Lower upstream manufacturing cost'
      : 'Tariff and freight burden';
    s.driverDetail = {
      manufacturingDelta: round5(manufacturingDelta),
      tradeBurden: round5(tradeBurden),
      netDelta: s.deltaVsDomestic,
    };
  }

  return {
    params: { dest, source, tech, year },
    baseline: {
      scenario: 'domestic',
      totalCostPerWp: destCost.totalCostPerWp,
    },
    scenarios,
    model: {
      solarModelVersion: destCost.model.version,
      tradeModelVersion: 'landed-cost-v2026.03',
    },
  };
}
