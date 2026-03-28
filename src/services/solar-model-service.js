import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelData = JSON.parse(
  readFileSync(join(__dirname, '../data/models/solar-irena-v2026.03.json'), 'utf-8')
);

const MODEL_VERSION = modelData.version;
const PROFIT_PCT = modelData.operatingProfit_pct;
const UNITS_SOLD_RATIO = modelData.unitsSoldRatio;

/**
 * Interpolate a roadmap parameter for a given year.
 * Uses linear interpolation between 2025 and 2030 values.
 */
function getRoadmapValue(param, year) {
  const y = String(year);
  if (modelData.technologyRoadmap[y] && modelData.technologyRoadmap[y][param] !== undefined) {
    return modelData.technologyRoadmap[y][param];
  }
  // Fallback: 2025 value
  return modelData.technologyRoadmap['2025'][param];
}

/**
 * Calculate polysilicon cost per Wp for a given country/tech/year.
 */
function calculatePolysiliconCost(country, tech, year) {
  const a = modelData.assumptions.polysilicon[tech];
  const c = modelData.countryInputs[country];
  const roadmap = modelData.technologyRoadmap[String(year)];

  const elecConsumption = roadmap.polyElectricity_kWhPerKg;
  const conversionGPerW = roadmap.polysiliconToW_gPerW;

  // Cost per kg of polysilicon
  const electricity = elecConsumption * c.electricityPrice_usdPerKWh;
  const materials = a.siliconMetalPrice_usdPerKg;
  const otherMaterials = a.otherMaterials_usdPerKg;
  const equipment = c.polysilicon.equipment_usdPerKg / a.equipmentLifetime_years;
  const building = c.polysilicon.building_usdPerKg / a.buildingLifetime_years;
  const maintenance = a.maintenance_pctCapex * (c.polysilicon.equipment_usdPerKg + c.polysilicon.building_usdPerKg);
  const labour = a.labourPerKg * c.avgSalary_usdPerYear;

  const directCostPerKg = electricity + materials + otherMaterials + equipment + building + maintenance + labour;
  const overheadsPerKg = directCostPerKg * a.overheads_pct;
  const profitPerKg = directCostPerKg * PROFIT_PCT;
  const totalPerKg = directCostPerKg + overheadsPerKg + profitPerKg;

  // Convert to $/Wp using g/W conversion rate
  const toWp = conversionGPerW / 1000;

  return {
    stage: 'polysilicon',
    costPerWp: round4(totalPerKg * toWp),
    components: {
      electricity: round4(electricity * toWp),
      materials: round4((materials + otherMaterials) * toWp),
      equipment: round4(equipment * toWp),
      building: round4(building * toWp),
      maintenance: round4(maintenance * toWp),
      labour: round4(labour * toWp),
      overheads: round4(overheadsPerKg * toWp),
      profit: round4(profitPerKg * toWp)
    }
  };
}

/**
 * Calculate wafer/ingot cost per Wp.
 */
function calculateWaferCost(country, tech, year) {
  const a = modelData.assumptions.wafer[tech];
  const c = modelData.countryInputs[country];
  const roadmap = modelData.technologyRoadmap[String(year)];

  const waferElec = roadmap.waferElectricity_kWhPerWafer;
  const cellEff = roadmap.cellEfficiency_pct;

  // Watts per wafer = area * irradiance * efficiency
  const wattsPerWafer = a.waferArea_m2 * a.irradiance_wPerM2 * cellEff;

  // Cost components per wafer, then divide by watts
  const electricity = (waferElec * c.electricityPrice_usdPerKWh) / wattsPerWafer;
  const otherMaterials = a.otherMaterials_usdPerWp;
  const equipment = (c.wafer.equipment_usdPerKW / 1000) / a.equipmentLifetime_years;
  const building = (c.wafer.building_usdPerKWp / 1000) / a.buildingLifetime_years;
  const maintenance = a.maintenance_pctCapex * ((c.wafer.equipment_usdPerKW + c.wafer.building_usdPerKWp) / 1000);
  const labour = a.labourPerW * c.avgSalary_usdPerYear;

  const directCost = electricity + otherMaterials + equipment + building + maintenance + labour;
  // IRENA: overheads ~10% of direct cost, profit ~15% of direct cost (additive, not compounded)
  const overheads = directCost * a.overheads_pct;
  const profit = directCost * PROFIT_PCT;
  const costPerWp = directCost + overheads + profit;

  return {
    stage: 'wafer',
    costPerWp: round4(costPerWp),
    components: {
      electricity: round4(electricity),
      materials: round4(otherMaterials),
      equipment: round4(equipment),
      building: round4(building),
      maintenance: round4(maintenance),
      labour: round4(labour),
      overheads: round4(overheads),
      profit: round4(profit)
    }
  };
}

/**
 * Calculate cell cost per Wp.
 */
function calculateCellCost(country, tech, year) {
  const a = modelData.assumptions.cell[tech];
  const c = modelData.countryInputs[country];
  const roadmap = modelData.technologyRoadmap[String(year)];

  const cellElec = roadmap.cellElectricity_kWhPerW;
  // Roadmap silverConsumption is in kg/Wp but values like 0.0115 are actually g/Wp
  // IRENA Table 9: silver paste usage ~11.5 mg/Wp = 0.0000115 kg/Wp
  // The roadmap stores it as 0.0115 meaning mg/Wp, so divide by 1000 to get kg/Wp
  const silverConsumption_kgPerWp = roadmap.silverConsumption_kgPerWp / 1000;

  const electricity = cellElec * c.electricityPrice_usdPerKWh;
  const silverCost = silverConsumption_kgPerWp * a.silverPrice_usdPerKg;
  const equipment = (c.cell.equipment_usdPerKW / 1000) / a.equipmentLifetime_years;
  const building = (c.cell.building_usdPerKWp / 1000) / a.buildingLifetime_years;
  const maintenance = a.maintenance_pctCapex * ((c.cell.equipment_usdPerKW + c.cell.building_usdPerKWp) / 1000);
  const labour = a.labourPerW * c.avgSalary_usdPerYear;

  const directCost = electricity + silverCost + equipment + building + maintenance + labour;
  const overheads = directCost * a.overheads_pct;
  const profit = directCost * PROFIT_PCT;
  const costPerWp = directCost + overheads + profit;

  return {
    stage: 'cell',
    costPerWp: round4(costPerWp),
    components: {
      electricity: round4(electricity),
      materials: round4(silverCost),
      equipment: round4(equipment),
      building: round4(building),
      maintenance: round4(maintenance),
      labour: round4(labour),
      overheads: round4(overheads),
      profit: round4(profit)
    }
  };
}

/**
 * Calculate module assembly cost per Wp.
 */
function calculateModuleCost(country, tech, year) {
  const a = modelData.assumptions.module[tech];
  const c = modelData.countryInputs[country];
  const roadmap = modelData.technologyRoadmap[String(year)];

  const moduleElec = roadmap.moduleElectricity_kWhPerModule;
  const cellPower = roadmap.cellPower_W;

  // Electricity per Wp = kWh per module / watts per module (cell power * cells per module ~72)
  const wattsPerModule = cellPower * 72; // standard 72-cell module
  const electricity = (moduleElec * c.electricityPrice_usdPerKWh) / wattsPerModule;

  const otherMaterials = a.otherMaterials_usdPerWp;
  const equipment = (c.module.equipment_usdPerKW / 1000) / a.equipmentLifetime_years;
  const building = (c.module.building_usdPerKWp / 1000) / a.buildingLifetime_years;
  const maintenance = a.maintenance_pctCapex * ((c.module.equipment_usdPerKW + c.module.building_usdPerKWp) / 1000);
  const labour = a.labourPerW * c.avgSalary_usdPerYear;
  const esg = a.esgCertification_usdPerW;

  const directCost = electricity + otherMaterials + equipment + building + maintenance + labour + esg;
  const overheads = directCost * a.overheads_pct;
  const profit = directCost * PROFIT_PCT;
  const costPerWp = directCost + overheads + profit;

  return {
    stage: 'module',
    costPerWp: round4(costPerWp),
    components: {
      electricity: round4(electricity),
      materials: round4(otherMaterials),
      equipment: round4(equipment),
      building: round4(building),
      maintenance: round4(maintenance),
      labour: round4(labour),
      esg: round4(esg),
      overheads: round4(overheads),
      profit: round4(profit)
    }
  };
}

/**
 * Calculate total module cost — the main entry point.
 */
export function calculateSolarCost(country, tech, year) {
  const polysilicon = calculatePolysiliconCost(country, tech, year);
  const wafer = calculateWaferCost(country, tech, year);
  const cell = calculateCellCost(country, tech, year);
  const module = calculateModuleCost(country, tech, year);

  const total = round4(polysilicon.costPerWp + wafer.costPerWp + cell.costPerWp + module.costPerWp);

  return {
    totalCostPerWp: total,
    unit: 'USD/Wp',
    stageBreakdown: [polysilicon, wafer, cell, module],
    model: {
      version: MODEL_VERSION,
      country,
      tech,
      year
    }
  };
}

/**
 * Get benchmark for comparison.
 */
export function getBenchmark(country, tech, year) {
  const key = `${country}_${tech}_${year}`;
  return modelData.benchmarks[key] || null;
}

/**
 * Get all valid parameters.
 */
export function getModelMeta() {
  return {
    version: MODEL_VERSION,
    countries: modelData.countries,
    technologies: modelData.technologies,
    validYears: modelData.validYears
  };
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}
