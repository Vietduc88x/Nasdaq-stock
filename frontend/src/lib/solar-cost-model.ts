/**
 * IRENA Solar PV Module Cost Model — Frontend Implementation
 *
 * SYNC NOTE: Must produce identical results to backend src/services/solar-model-service.js
 * Benchmark: VN/TOPCon/2025 = $0.1786/Wp
 *
 * See CostCalculator.tsx for the UI. This file contains pure calculation logic.
 */

export interface CostInputs {
  siliconPrice: number;   // $/kg
  silverPrice: number;    // $/kg
  aluminumPrice: number;  // $/lb
  glassPrice: number;     // $/kg
  evaPrice: number;       // $/kg
  electricityPrice: number; // $/kWh
  avgSalary: number;      // $/year
  cellEfficiency: number; // % (e.g. 25.3)
  overheadPct: number;    // % (e.g. 10)
  profitPct: number;      // % (e.g. 15)
}

export interface CostResult {
  total: number;
  stages: { name: string; cost: number; color: string }[];
}

export const DEFAULTS: CostInputs = {
  siliconPrice: 1.70,
  silverPrice: 853,
  aluminumPrice: 1.15,
  glassPrice: 0.80,
  evaPrice: 1.85,
  electricityPrice: 0.07,
  avgSalary: 9000,
  cellEfficiency: 25.3,
  overheadPct: 10,
  profitPct: 15,
};

export function calculateModuleCost(inputs: CostInputs): CostResult {
  const {
    siliconPrice, silverPrice, aluminumPrice, glassPrice, evaPrice,
    electricityPrice, avgSalary, cellEfficiency, overheadPct, profitPct,
  } = inputs;

  const eff = cellEfficiency / 100;
  const overhead = overheadPct / 100;
  const profit = profitPct / 100;

  // Stage 1: Polysilicon (all costs per kg, then convert to $/Wp via g/W)
  const polyDirect =
    40 * electricityPrice +       // 40 kWh/kg × elec price
    siliconPrice + 1.2 +          // silicon metal + other materials
    15 / 10 +                     // equipment $15/kg ÷ 10yr lifetime
    5 / 20 +                      // building $5/kg ÷ 20yr lifetime
    0.04 * (15 + 5) +             // maintenance 4% of CAPEX
    0.000021 * avgSalary;         // labour per kg
  const polyCostPerWp = polyDirect * (1 + overhead + profit) * 2.1 / 1000;

  // Stage 2: Wafer (costs per Wp)
  const wattsPerWafer = 0.03822 * 1000 * eff; // wafer area × irradiance × efficiency
  const waferDirect =
    (0.9 * electricityPrice) / wattsPerWafer + // electricity per wafer ÷ watts
    0.015 +                       // other materials (crucibles, diamond wire)
    (40 / 1000) / 7 +             // equipment $40/kW ÷ 7yr
    (30 / 1000) / 20 +            // building $30/kWp ÷ 20yr
    0.04 * ((40 + 30) / 1000) +   // maintenance
    0.000000215 * avgSalary;      // labour per W
  const waferCostPerWp = waferDirect * (1 + overhead + profit);

  // Stage 3: Cell (costs per Wp)
  const cellDirect =
    0.056 * electricityPrice +         // 0.056 kWh/W × elec price
    0.0000115 * silverPrice +          // 11.5 mg/Wp silver consumption
    (35 / 1000) / 5 +                  // equipment $35/kW ÷ 5yr
    (30 / 1000) / 20 +                 // building $30/kWp ÷ 20yr
    0.04 * ((35 + 30) / 1000) +        // maintenance
    0.000000215 * avgSalary;           // labour per W
  const cellCostPerWp = cellDirect * (1 + overhead + profit);

  // Stage 4: Module Assembly (costs per Wp)
  // IRENA lump sum: $0.057/Wp for all module materials
  // Decomposed: glass + EVA + aluminum + remainder (backsheet, jbox, sealant)
  const baseGlass = 0.0045;
  const baseEva = 0.0022;
  const baseAl = 0.0038;
  const baseRest = 0.057 - baseGlass - baseEva - baseAl;

  const moduleMaterials =
    (glassPrice * 5.6) / 1000 +       // glass: 5.6 g/Wp
    (evaPrice * 1.2) / 1000 +         // EVA: 1.2 g/Wp
    (aluminumPrice * 1.5 / 453.592) + // Al: 1.5 g/Wp, convert lb→g
    baseRest;                          // backsheet, jbox, etc.

  const moduleDirect =
    (0.025 * electricityPrice) / (9.67 * 72) + // electricity per module ÷ watts
    moduleMaterials +
    (13 / 1000) / 5 +                 // equipment $13/kW ÷ 5yr
    (20 / 1000) / 20 +                // building $20/kWp ÷ 20yr
    0.04 * ((13 + 20) / 1000) +       // maintenance
    0.000000264 * avgSalary +          // labour per W
    0.0006;                            // ESG certification
  const moduleCostPerWp = moduleDirect * (1 + overhead + profit);

  const total = polyCostPerWp + waferCostPerWp + cellCostPerWp + moduleCostPerWp;

  return {
    total: Math.round(total * 10000) / 10000,
    stages: [
      { name: 'Polysilicon', cost: Math.round(polyCostPerWp * 10000) / 10000, color: '#34C759' },
      { name: 'Wafer', cost: Math.round(waferCostPerWp * 10000) / 10000, color: '#3b82f6' },
      { name: 'Cell', cost: Math.round(cellCostPerWp * 10000) / 10000, color: '#f59e0b' },
      { name: 'Module', cost: Math.round(moduleCostPerWp * 10000) / 10000, color: '#a855f7' },
    ],
  };
}
