import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateSolarCost } from './solar-model-service.js';
import { getSystemMaterials } from './impact-service.js';
import { getPrice } from './market-data-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lagModel = JSON.parse(
  readFileSync(join(__dirname, '../data/forecast/solar-lag-model.json'), 'utf-8')
);

/**
 * Get lag model config for a material slug.
 * Returns { passThrough, lagDaysMin, lagDaysMax, priority } or defaults.
 */
export function getLagModelForMaterial(slug) {
  const config = lagModel.materials[slug];
  if (config) {
    return {
      passThrough: config.passThrough,
      lagDaysMin: config.lagDaysMin,
      lagDaysMax: config.lagDaysMax,
      priority: config.priority,
    };
  }
  // Default for unknown materials: conservative
  return { passThrough: 0.50, lagDaysMin: 30, lagDaysMax: 90, priority: 99 };
}

/**
 * Compute a 5-day price change from sparkline data.
 * Returns null if sparkline is unavailable or insufficient.
 */
function compute5dChangePct(price) {
  if (!price?.sparkline5d || price.sparkline5d.length < 2) return null;
  const first = price.sparkline5d[0];
  const last = price.sparkline5d[price.sparkline5d.length - 1];
  if (!first || first === 0) return null;
  return ((last - first) / first) * 100;
}

/**
 * Build per-material signal data by combining baseline costs, live prices, and lag model.
 */
async function buildMaterialSignals(solarMaterials, modeledTotalCost) {
  const signals = [];

  for (const mat of solarMaterials) {
    const price = await getPrice(mat.slug);
    const lag = getLagModelForMaterial(mat.slug);
    const changePct = compute5dChangePct(price);
    const isLive = price && !price.fallbackUsed && price.source !== 'reference';

    const weightPct = modeledTotalCost > 0
      ? Math.round((mat.baselineCost / modeledTotalCost) * 1000) / 10
      : 0;

    // Signal contribution: how much this material's recent price move
    // would shift total module cost, weighted by pass-through
    const signalContribution = changePct !== null
      ? (changePct / 100) * mat.baselineCost * lag.passThrough
      : 0;

    signals.push({
      material: mat.slug,
      baselineContribution: mat.baselineCost,
      currentContribution: changePct !== null
        ? mat.baselineCost * (1 + (changePct / 100) * lag.passThrough)
        : mat.baselineCost,
      weightPct,
      changePct: changePct !== null ? Math.round(changePct * 100) / 100 : null,
      passThrough: lag.passThrough,
      lagDaysMin: lag.lagDaysMin,
      lagDaysMax: lag.lagDaysMax,
      lagLabel: `${Math.round(lag.lagDaysMin / 7)}-${Math.round(lag.lagDaysMax / 7)} weeks`,
      signalContribution: Math.round(signalContribution * 100000) / 100000,
      dataQuality: isLive ? 'live' : 'reference',
    });
  }

  return signals;
}

/**
 * Compute nowcast: modeled cost adjusted for current material price movements.
 * Only adjusts for materials with live price data.
 */
export function computeNowcast(modeledCost, materials, signals) {
  let adjustment = 0;
  for (const sig of signals) {
    if (sig.dataQuality === 'live' && sig.changePct !== null) {
      // Use 24h change for nowcast (immediate effect)
      adjustment += sig.signalContribution;
    }
  }
  return Math.round((modeledCost + adjustment) * 10000) / 10000;
}

/**
 * Compute forward-looking lead indicator from material signals.
 * Returns { label, score } where score is weighted sum of signal contributions.
 */
export function computeLeadIndicator(signals) {
  let weightedScore = 0;
  let totalWeight = 0;

  for (const sig of signals) {
    if (sig.changePct !== null && sig.dataQuality === 'live') {
      const weight = sig.baselineContribution;
      weightedScore += sig.changePct * sig.passThrough * weight;
      totalWeight += weight;
    }
  }

  const score = totalWeight > 0
    ? Math.round((weightedScore / totalWeight) * 100) / 100
    : 0;

  let label;
  if (score < -2) label = 'Falling';
  else if (score <= 2) label = 'Stable';
  else if (score <= 6) label = 'Rising';
  else label = 'Strongly Rising';

  // Compute expected lag as weighted average of material lags
  let lagSum = 0;
  let lagWeight = 0;
  for (const sig of signals) {
    if (sig.changePct !== null && sig.dataQuality === 'live') {
      const absContrib = Math.abs(sig.signalContribution);
      lagSum += ((sig.lagDaysMin + sig.lagDaysMax) / 2) * absContrib;
      lagWeight += absContrib;
    }
  }
  const avgLagDays = lagWeight > 0 ? Math.round(lagSum / lagWeight) : 45;
  const lagWeeksMin = Math.round(Math.max(avgLagDays - 7, 7) / 7);
  const lagWeeksMax = Math.round((avgLagDays + 14) / 7);
  const expectedLag = `${lagWeeksMin}-${lagWeeksMax} weeks`;

  return { label, score, expectedLag };
}

/**
 * Compute confidence level based on data quality of material signals.
 * More live data = higher confidence.
 */
export function computeConfidence(signals) {
  const total = signals.length;
  if (total === 0) return 'Low';

  const liveCount = signals.filter(s => s.dataQuality === 'live').length;
  const livePct = liveCount / total;

  // Also weight by cost contribution: live coverage of high-cost materials matters more
  let liveCostWeight = 0;
  let totalCostWeight = 0;
  for (const sig of signals) {
    totalCostWeight += sig.baselineContribution;
    if (sig.dataQuality === 'live') {
      liveCostWeight += sig.baselineContribution;
    }
  }
  const liveCostPct = totalCostWeight > 0 ? liveCostWeight / totalCostWeight : 0;

  // Combined: count-based and cost-weighted
  const combined = (livePct + liveCostPct) / 2;

  if (combined >= 0.5) return 'High';
  if (combined >= 0.25) return 'Medium';
  return 'Low';
}

/**
 * Pick top N drivers by absolute signal contribution.
 */
export function pickTopDrivers(signals, limit = 3) {
  return [...signals]
    .sort((a, b) => Math.abs(b.signalContribution) - Math.abs(a.signalContribution))
    .slice(0, limit)
    .map(sig => ({
      material: sig.material,
      changePct: sig.changePct,
      weightPct: sig.weightPct,
      passThrough: sig.passThrough,
      lagLabel: sig.lagLabel,
      signalContribution: sig.signalContribution,
    }));
}

/**
 * Main entry: calculate full solar forecast for a country/tech/year.
 */
export async function calculateSolarForecast(country, tech, year) {
  const cost = calculateSolarCost(country, tech, year);
  const modeledCost = cost.totalCostPerWp;
  const solarMaterials = getSystemMaterials('solar');

  const signals = await buildMaterialSignals(solarMaterials, modeledCost);

  const nowcastCost = computeNowcast(modeledCost, solarMaterials, signals);
  const leadIndicator = computeLeadIndicator(signals);
  const confidence = computeConfidence(signals);
  const topDrivers = pickTopDrivers(signals);

  // Forward 30d estimate: modeled cost + signal contributions (lagged)
  // Simple v1: same direction as nowcast but dampened by average pass-through
  const totalSignal = signals.reduce((sum, s) => sum + s.signalContribution, 0);
  const forward30dCost = Math.round((modeledCost + totalSignal) * 10000) / 10000;

  return {
    currentModeledCost: modeledCost,
    nowcastCost,
    forward30dCost,
    leadIndicator: {
      label: leadIndicator.label,
      score: leadIndicator.score,
      confidence,
      expectedLag: leadIndicator.expectedLag,
    },
    topDrivers,
  };
}
