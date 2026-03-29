/**
 * Wind Cost Engine — IRENA-based onshore wind turbine costing
 *
 * Source: IRENA Renewable Power Generation Costs 2023 + NREL 2024 Cost of Wind Energy Review
 *
 * 5-stage bottom-up model for onshore wind turbines. Costs in $/kW (installed capacity).
 * Reference turbine: 3MW onshore. Technology roadmap applies annual cost reductions
 * from longer blades, taller towers, and manufacturing scale.
 *
 *  COST FLOW (5 stages):
 *  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐
 *  │  Blade   │→ │ Nacelle  │→ │  Tower   │→ │ Electrical │→ │ Installation │
 *  │Fiberglass│  │Generator │  │ Steel    │  │ Cabling    │  │ Foundation   │
 *  │ Carbon   │  │ Magnets  │  │ Zinc     │  │ Substation │  │ Crane        │
 *  │  Fiber   │  │ Gearbox  │  │ Fab+     │  │ SCADA      │  │ Civil works  │
 *  │ Resin    │  │ Power    │  │Transport │  │            │  │Commissioning │
 *  │ Labor    │  │ Housing  │  │          │  │            │  │              │
 *  └──────────┘  └──────────┘  └──────────┘  └────────────┘  └──────────────┘
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelData = JSON.parse(
  readFileSync(join(__dirname, '../data/models/wind-irena-v2026.json'), 'utf-8')
);

const MODEL_VERSION = modelData.version;

function round1(n) { return Math.round(n * 10) / 10; }

function getRoadmap(year) {
  const y = String(year);
  return modelData.technologyRoadmap[y] || modelData.technologyRoadmap['2025'];
}

/**
 * Sum all component costs in a stage and apply technology roadmap cost reduction.
 */
function calculateStageCost(stageName, roadmap) {
  const stage = modelData.stages[stageName];
  if (!stage) throw new Error(`Unknown stage: ${stageName}`);

  const reductionFactor = 1 - (roadmap.costReductionPct / 100);
  const components = {};
  let total = 0;

  for (const [key, comp] of Object.entries(stage.components)) {
    const adjusted = comp.baselineCostPerKw * reductionFactor;
    components[key] = round1(adjusted);
    total += adjusted;
  }

  return { total: round1(total), components };
}

/**
 * Calculate wind turbine cost — main entry point.
 * @param {string} turbineType - 'onshore' (offshore deferred)
 * @param {number} year - 2025-2030
 * @returns {{ totalCostPerKw, stageBreakdown, model }}
 */
export function calculateWindCost(turbineType, year) {
  if (turbineType !== 'onshore') {
    throw new RangeError(`Unsupported turbine type: ${turbineType}. Only 'onshore' is supported.`);
  }
  if (year < 2025 || year > 2030) {
    throw new RangeError(`Year ${year} out of range. Valid: 2025-2030.`);
  }

  const roadmap = getRoadmap(year);

  const stages = ['blade', 'nacelle', 'tower', 'electrical', 'installation'];
  const stageBreakdown = [];
  let totalCost = 0;

  for (const stageName of stages) {
    const { total, components } = calculateStageCost(stageName, roadmap);
    stageBreakdown.push({
      stage: stageName,
      costPerKw: total,
      components,
    });
    totalCost += total;
  }

  // NaN/Infinity guard
  for (const s of stageBreakdown) {
    if (!Number.isFinite(s.costPerKw) || s.costPerKw < 0) {
      throw new Error(`Invalid cost for stage ${s.stage}: ${s.costPerKw}`);
    }
  }

  return {
    totalCostPerKw: round1(totalCost),
    unit: '$/kW',
    stageBreakdown,
    model: {
      version: MODEL_VERSION,
      turbineType,
      year,
      referenceCapacityMW: modelData.referenceCapacityMW,
      bladeLengthM: roadmap.bladeLengthM,
      hubHeightM: roadmap.hubHeightM,
      capacityFactorPct: roadmap.capacityFactorPct,
    },
  };
}

/**
 * Get benchmark for regression tests.
 */
export function getWindBenchmark(turbineType, year) {
  const key = `${turbineType}_${year}`;
  return modelData.benchmarks[key] || null;
}

/**
 * Get model metadata.
 */
export function getWindModelMeta() {
  return {
    version: MODEL_VERSION,
    turbineTypes: modelData.turbineTypes,
    validYears: modelData.validYears,
    referenceCapacityMW: modelData.referenceCapacityMW,
    provenanceNote: modelData.provenanceNote,
  };
}
