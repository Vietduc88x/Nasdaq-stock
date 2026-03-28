/**
 * BESS Cost Engine — BatPaC-native costing
 *
 * Source: Argonne National Laboratory BatPaC v5.0 (ANL/CSE-24/1, 2024)
 * Material intensity: Faraday Institution Insights Issue 6
 *
 * Unlike the solar model (which applies uniform overhead/profit per stage),
 * this engine uses BatPaC's bottom-up engineering cost structure where
 * manufacturing costs are explicit process steps, not markup percentages.
 *
 * Provenance: outputs reflect ideal manufacturing at scale, not market prices.
 * BNEF 2025 pack prices ($81/kWh LFP, $128/kWh NMC) include supply chain
 * premiums and margins not modeled here.
 *
 *  COST FLOW (5 stages):
 *  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────┐
 *  │ Cathode  │→ │  Anode   │→ │Cell Components│→ │Cell Assembly │→ │ Pack │
 *  │ CAM+     │  │ Graphite │  │ Electrolyte   │  │ Coating      │  │ BMS  │
 *  │ binder   │  │ Si blend │  │ Separator     │  │ Assembly     │  │Thermal│
 *  │ additive │  │ binder   │  │ Cu/Al foil    │  │ Formation    │  │Housing│
 *  │ solvent  │  │ Cu foil  │  │               │  │ QC testing   │  │Wiring │
 *  └──────────┘  └──────────┘  └──────────────┘  └──────────────┘  └──────┘
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelData = JSON.parse(
  readFileSync(join(__dirname, '../data/models/bess-argonne-v2024.json'), 'utf-8')
);

const MODEL_VERSION = modelData.version;

function round2(n) { return Math.round(n * 100) / 100; }

function getMaterialPrices(year) {
  const y = String(year);
  return modelData.materialPrices[y] || modelData.materialPrices['2025'];
}

function getRoadmap(year) {
  const y = String(year);
  return modelData.technologyRoadmap[y] || modelData.technologyRoadmap['2025'];
}

/**
 * Calculate BESS cost — main entry point.
 * @param {string} chemistry - 'lfp' or 'nmc811'
 * @param {number} year - 2025-2035
 * @returns {{ totalCostPerKwh, stageBreakdown, model }}
 */
export function calculateBessCost(chemistry, year) {
  const prices = getMaterialPrices(year);
  const intensity = modelData.materialIntensity[chemistry];
  const mfg = modelData.manufacturing[chemistry];
  const pack = modelData.pack;
  const roadmap = getRoadmap(year);

  if (!intensity || !mfg) {
    throw new Error(`Unknown chemistry: ${chemistry}`);
  }

  // BatPaC material intensity data already accounts for typical yield losses.
  // Do not double-apply yield factor. The roadmap cellYield is tracked for
  // provenance but not used as a multiplier on material quantities.
  const yieldFactor = 1.0;

  // === Stage 1: Cathode ===
  const cathodeCamPrice = chemistry === 'lfp'
    ? prices.lfp_cathode_usdPerKg
    : prices.nmc811_cathode_usdPerKg;
  const cathodeCam = cathodeCamPrice * intensity.cathode_kgPerKwh * yieldFactor;
  const cathodeAdditive = prices.carbon_additive_usdPerKg * intensity.carbon_additive_kgPerKwh * yieldFactor;
  const cathodeBinder = prices.binder_positive_usdPerKg * intensity.binder_positive_kgPerKwh * yieldFactor;
  const cathodeCost = cathodeCam + cathodeAdditive + cathodeBinder;

  // === Stage 2: Anode ===
  const graphiteFraction = 1 - intensity.silicon_anode_fraction;
  const siliconFraction = intensity.silicon_anode_fraction;
  const anodeActive = (
    prices.graphite_anode_usdPerKg * intensity.graphite_kgPerKwh * graphiteFraction +
    prices.silicon_anode_usdPerKg * intensity.graphite_kgPerKwh * siliconFraction
  ) * yieldFactor;
  const anodeBinder = prices.binder_negative_usdPerKg * intensity.binder_negative_kgPerKwh * yieldFactor;
  const anodeCuFoil = prices.cu_foil_usdPerM2 * intensity.cu_foil_m2PerKwh * yieldFactor;
  const anodeCost = anodeActive + anodeBinder + anodeCuFoil;

  // === Stage 3: Cell Components (electrolyte + separator + Al foil) ===
  const electrolyte = prices.electrolyte_usdPerL * intensity.electrolyte_LPerKwh * yieldFactor;
  const separator = prices.separator_usdPerM2 * intensity.separator_m2PerKwh * yieldFactor;
  const alFoil = prices.al_foil_usdPerM2 * intensity.al_foil_m2PerKwh * yieldFactor;
  const cellComponentsCost = electrolyte + separator + alFoil;

  // === Stage 4: Cell Assembly (manufacturing) ===
  // BatPaC-native: explicit process costs, not overhead/profit markup
  const cellAssemblyCost =
    mfg.electrode_coating_usdPerKwh +
    mfg.cell_assembly_usdPerKwh +
    mfg.formation_cycling_usdPerKwh +
    mfg.quality_testing_usdPerKwh;

  // === Stage 5: Pack ===
  const packCost =
    pack.bms_usdPerKwh +
    pack.thermal_management_usdPerKwh +
    pack.pack_housing_usdPerKwh +
    pack.wiring_connectors_usdPerKwh +
    pack.module_assembly_labor_usdPerKwh +
    pack.pack_assembly_labor_usdPerKwh;

  const total = cathodeCost + anodeCost + cellComponentsCost + cellAssemblyCost + packCost;

  // Finite-value guard
  const stages = [
    { stage: 'cathode', costPerKwh: round2(cathodeCost), components: { activeMaterial: round2(cathodeCam), additive: round2(cathodeAdditive), binder: round2(cathodeBinder) } },
    { stage: 'anode', costPerKwh: round2(anodeCost), components: { activeMaterial: round2(anodeActive), binder: round2(anodeBinder), cuFoil: round2(anodeCuFoil) } },
    { stage: 'cellComponents', costPerKwh: round2(cellComponentsCost), components: { electrolyte: round2(electrolyte), separator: round2(separator), alFoil: round2(alFoil) } },
    { stage: 'cellAssembly', costPerKwh: round2(cellAssemblyCost), components: { electrodeCoating: round2(mfg.electrode_coating_usdPerKwh), cellAssembly: round2(mfg.cell_assembly_usdPerKwh), formationCycling: round2(mfg.formation_cycling_usdPerKwh), qualityTesting: round2(mfg.quality_testing_usdPerKwh) } },
    { stage: 'pack', costPerKwh: round2(packCost), components: { bms: round2(pack.bms_usdPerKwh), thermalManagement: round2(pack.thermal_management_usdPerKwh), housing: round2(pack.pack_housing_usdPerKwh), wiring: round2(pack.wiring_connectors_usdPerKwh), moduleLabor: round2(pack.module_assembly_labor_usdPerKwh), packLabor: round2(pack.pack_assembly_labor_usdPerKwh) } },
  ];

  // NaN/Infinity guard
  for (const s of stages) {
    if (!Number.isFinite(s.costPerKwh) || s.costPerKwh < 0) {
      throw new Error(`Invalid cost for stage ${s.stage}: ${s.costPerKwh}`);
    }
  }

  return {
    totalCostPerKwh: round2(total),
    unit: '$/kWh',
    stageBreakdown: stages,
    model: {
      version: MODEL_VERSION,
      chemistry,
      year,
      costingMethod: 'batpac_native',
    },
  };
}

/**
 * Get benchmark for regression tests.
 */
export function getBessBenchmark(chemistry, year) {
  const key = `${chemistry}_${year}`;
  return modelData.benchmarks[key] || null;
}

/**
 * Get model metadata.
 */
export function getBessModelMeta() {
  return {
    version: MODEL_VERSION,
    chemistries: modelData.chemistries,
    validYears: modelData.validYears,
    provenanceNote: modelData.provenanceNote,
  };
}
