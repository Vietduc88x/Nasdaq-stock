import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readSnapshot } from './brief-service.js';
import { calculateSolarCost } from './solar-model-service.js';
import { calculateBessCost } from './bess-cost-engine.js';
import { calculateWindCost } from './wind-cost-engine.js';
import { calculateLandedCost } from './landed-cost-engine.js';
import { getAllMaterials } from './impact-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SNAPSHOTS_DIR = join(__dirname, '../data/snapshots');

const TRACKED_MATERIALS = ['silver', 'copper', 'aluminum', 'gold', 'steel', 'zinc'];
const SOLAR_YEARS = [2025, 2026, 2028, 2030];
const BESS_YEARS = [2025, 2026, 2028, 2030, 2035];
const WIND_YEARS = [2025, 2026, 2028, 2030];

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function safeSnapshotDates() {
  try {
    return readdirSync(SNAPSHOTS_DIR)
      .filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .map(name => name.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

function getMaterialCatalogMap() {
  return new Map(getAllMaterials().map(material => [material.slug, material]));
}

function buildObservedMaterialSeries(slug, snapshotDates, materialMap) {
  const material = materialMap.get(slug);
  if (!material) return null;

  const points = snapshotDates
    .map(date => {
      const snapshot = readSnapshot(date);
      const price = snapshot?.prices?.find(entry => entry.slug === slug);
      if (!price || price.value === null) return null;
      return {
        date,
        value: round4(price.value),
        unit: price.unit,
        source: price.source,
        coverageTier: price.coverageTier,
      };
    })
    .filter(Boolean);

  if (points.length === 0) return null;

  const first = points[0];
  const latest = points[points.length - 1];
  const changePct = first.value > 0
    ? round2(((latest.value - first.value) / first.value) * 100)
    : 0;

  return {
    slug,
    name: material.name,
    icon: material.icon,
    unit: latest.unit,
    points,
    latestValue: latest.value,
    latestDate: latest.date,
    changePctSinceStart: changePct,
  };
}

function buildRoadmapSeries(label, unit, years, calculator) {
  const points = years.map(year => {
    const result = calculator(year);
    return {
      date: String(year),
      value: result.value,
    };
  });

  const first = points[0];
  const latest = points[points.length - 1];
  const changePct = first.value > 0
    ? round2(((latest.value - first.value) / first.value) * 100)
    : 0;

  return {
    label,
    unit,
    points,
    latestValue: latest.value,
    latestDate: latest.date,
    changePctSinceStart: changePct,
  };
}

function buildSystemSeries(label, unit, years, selectedYear, calculator) {
  const points = years.map(year => ({
    date: String(year),
    value: calculator(year),
    projected: year > selectedYear,
  }));

  const currentPoint = points.find(point => point.date === String(selectedYear)) || points[0];
  const first = points[0];
  const changePct = first.value > 0
    ? round2(((currentPoint.value - first.value) / first.value) * 100)
    : 0;

  return {
    label,
    unit,
    points,
    latestValue: currentPoint.value,
    latestDate: currentPoint.date,
    changePctSinceStart: changePct,
    selectedYear,
  };
}

export function getSolarHistorySeries(country = 'VN', tech = 'topcon', selectedYear = 2025) {
  return buildSystemSeries(
    `${country} ${tech.toUpperCase()} module benchmark`,
    '$/Wp',
    SOLAR_YEARS,
    selectedYear,
    year => calculateSolarCost(country, tech, year).totalCostPerWp
  );
}

export function getBessHistorySeries(chemistry = 'lfp', selectedYear = 2025) {
  return buildSystemSeries(
    `${chemistry.toUpperCase()} pack benchmark`,
    '$/kWh',
    BESS_YEARS,
    selectedYear,
    year => calculateBessCost(chemistry, year).totalCostPerKwh
  );
}

export function getWindHistorySeries(turbineType = 'onshore', selectedYear = 2025) {
  return buildSystemSeries(
    `${turbineType} wind benchmark`,
    '$/kW',
    WIND_YEARS,
    selectedYear,
    year => calculateWindCost(turbineType, year).totalCostPerKw
  );
}

export function getHistoryPageData() {
  const snapshotDates = safeSnapshotDates();
  const materialMap = getMaterialCatalogMap();

  const observedMaterials = TRACKED_MATERIALS
    .map(slug => buildObservedMaterialSeries(slug, snapshotDates, materialMap))
    .filter(Boolean);

  const roadmapBenchmarks = [
    buildRoadmapSeries('Solar PV Module - Vietnam TOPCon', '$/Wp', SOLAR_YEARS, year => ({
      value: calculateSolarCost('VN', 'topcon', year).totalCostPerWp,
    })),
    buildRoadmapSeries('BESS Pack - LFP', '$/kWh', BESS_YEARS, year => ({
      value: calculateBessCost('lfp', year).totalCostPerKwh,
    })),
    buildRoadmapSeries('Onshore Wind Turbine', '$/kW', WIND_YEARS, year => ({
      value: calculateWindCost('onshore', year).totalCostPerKw,
    })),
    buildRoadmapSeries('CN->US Module DDP - Current Policy', '$/Wp', [2025, 2026], year => ({
      value: calculateLandedCost({
        from: 'CN',
        to: 'US',
        product: 'module',
        exw: calculateSolarCost('CN', 'topcon', year).totalCostPerWp,
        regime: 'current',
      }).breakdown.ddp,
    })),
  ];

  return {
    observedMaterials,
    roadmapBenchmarks,
    meta: {
      snapshotCount: snapshotDates.length,
      historyStartDate: snapshotDates[0] || null,
      latestSnapshotDate: snapshotDates[snapshotDates.length - 1] || null,
      trackedMaterialCount: observedMaterials.length,
      notes: {
        observed: 'Observed history comes from persisted daily snapshots. Missing days remain missing.',
        roadmap: 'Roadmap series are modeled benchmarks using current versioned engines, not collected market history.',
      },
    },
  };
}
