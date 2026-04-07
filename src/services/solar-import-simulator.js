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
import { calculateLandedCost, getLandedCostMeta } from './landed-cost-engine.js';
import { buildScenarioUpliftIndex } from './idiot-index-service.js';

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
    scenarioIndex: null,
  };
}

/**
 * Calculate a single import scenario.
 */
export function calculateSolarImportScenario({ dest, source, tech, year, scenario, regime = 'current' }) {
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
    const landed = calculateLandedCost({ from: source, to: dest, product: 'wafer', exw: round5(waferExportExw), regime });
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
    const landed = calculateLandedCost({ from: source, to: dest, product: 'cell', exw: round5(cellExportExw), regime });
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
    const landed = calculateLandedCost({ from: source, to: dest, product: 'module', exw: round5(moduleExportExw), regime });

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
export function calculateSolarImportComparison({ dest, source, tech, year, regime = 'current' }) {
  const destCost = calculateSolarCost(dest, tech, year);
  const destStages = getSolarStageMap(destCost);

  const scenarios = VALID_SCENARIOS.map(scenario =>
    calculateSolarImportScenario({ dest, source, tech, year, scenario, regime })
  );

  // Best-driver analysis for each import scenario
  for (const s of scenarios) {
    if (s.scenario === 'domestic') {
      s.mainDriver = null;
      s.scenarioIndex = buildScenarioUpliftIndex({
        title: 'Scenario Index',
        unit: '$/Wp',
        baseCost: destStages.polysilicon + destStages.wafer + destStages.cell + destStages.module,
        finishedCost: s.totalCostPerWp,
        topDriver: {
          label: 'Local conversion stack',
          value: round5(s.totalCostPerWp - (destStages.polysilicon + destStages.wafer + destStages.cell + destStages.module)),
        },
      });
      s.scenarioIndex.contributors = s.stageBreakdown.map(stage => ({
        label: stage.stage,
        value: round5(stage.costPerWp),
      }));
      continue;
    }

    let equivalentLocalUpstream;
    let scenarioFactoryValue;
    switch (s.tradeAdders.product) {
      case 'wafer':
        equivalentLocalUpstream = destStages.polysilicon + destStages.wafer;
        scenarioFactoryValue = s.tradeAdders.exportExw + destStages.cell + destStages.module;
        break;
      case 'cell':
        equivalentLocalUpstream = destStages.polysilicon + destStages.wafer + destStages.cell;
        scenarioFactoryValue = s.tradeAdders.exportExw + destStages.module;
        break;
      case 'module':
        equivalentLocalUpstream = destCost.totalCostPerWp;
        scenarioFactoryValue = s.tradeAdders.exportExw;
        break;
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
    s.scenarioIndex = buildScenarioUpliftIndex({
      title: 'Scenario Index',
      unit: '$/Wp',
      baseCost: scenarioFactoryValue,
      finishedCost: s.totalCostPerWp,
      topDriver: {
        label: s.mainDriver === 'Tariff and freight burden' ? 'Trade burden' : 'Factory value gap',
        value: Math.abs(s.mainDriver === 'Tariff and freight burden' ? tradeBurden : manufacturingDelta),
      },
    });
    s.scenarioIndex.contributors = s.stageBreakdown.map(stage => ({
      label: stage.stage,
      value: round5(stage.costPerWp),
    }));
  }

  // Ranking: find cheapest scenario under this regime
  const cheapest = scenarios.reduce((min, s) => s.totalCostPerWp < min.totalCostPerWp ? s : min);

  // Compare with current regime ranking to detect flips
  let ranking;
  if (regime === 'current') {
    ranking = {
      cheapestScenario: cheapest.scenario,
      previousCheapestScenario: cheapest.scenario,
      rankingChanged: false,
    };
  } else {
    const currentScenarios = VALID_SCENARIOS.map(scenario =>
      calculateSolarImportScenario({ dest, source, tech, year, scenario, regime: 'current' })
    );
    const currentCheapest = currentScenarios.reduce((min, s) => s.totalCostPerWp < min.totalCostPerWp ? s : min);
    ranking = {
      cheapestScenario: cheapest.scenario,
      previousCheapestScenario: currentCheapest.scenario,
      rankingChanged: cheapest.scenario !== currentCheapest.scenario,
    };
  }

  return {
    params: { dest, source, tech, year, regime },
    baseline: {
      scenario: 'domestic',
      totalCostPerWp: destCost.totalCostPerWp,
    },
    scenarios,
    ranking,
    model: {
      solarModelVersion: destCost.model.version,
      tradeModelVersion: getLandedCostMeta().version,
    },
  };
}
