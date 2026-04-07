export interface MaterialPrice {
  value: number;
  unit: string;
  normalizedValue: number;
  normalizedUnit: string;
  coverageTier: string;
  source: string;
  asOf: string | null;
  staleAfterSeconds: number | null;
  fallbackUsed: boolean;
  change24hPct: number | null;
  previousClose: number | null;
  sparkline5d: number[] | null;
}

export interface MaterialSummary {
  slug: string;
  name: string;
  icon: string;
  category: string;
  coverageTier: string;
  systems: string[];
  currentPrice: MaterialPrice | null;
}

export interface StageBreakdown {
  stage: string;
  costPerWp?: number;    // Solar: $/Wp
  costPerKwh?: number;   // BESS: $/kWh
  costPerKw?: number;    // Wind: $/kW
  components: Record<string, number>;
}

export interface MaterialImpact {
  material: string;
  name: string;
  icon: string;
  coverageTier: string;
  priceSource: string;
  asOf: string | null;
  currentPrice: { value: number; unit: string } | null;
  component: string;
  // Solar-specific ($/Wp)
  baselineContributionPerWp?: number;
  shareOfSystemPct?: number;
  impactPer10Pct?: number;
  // BESS-specific ($/kWh) — also used by generic getMaterialCost() helper
  baselineCost?: number;
  costUnit?: string;
}

export interface ForecastDriver {
  material: string;
  changePct: number | null;
  weightPct: number;
  passThrough: number;
  lagLabel: string;
  signalContribution: number;
}

export interface ForecastData {
  currentModeledCost: number;
  nowcastCost: number;
  forward30dCost: number;
  leadIndicator: {
    label: 'Falling' | 'Stable' | 'Rising' | 'Strongly Rising';
    score: number;
    confidence: 'High' | 'Medium' | 'Low';
    expectedLag: string;
  };
  topDrivers: ForecastDriver[];
}

export interface SolarPageData {
  params: { country: string; tech: string; year: number };
  model: { version: string; asOf: string; totalCostPerWp: number };
  stageBreakdown: StageBreakdown[];
  materialImpacts: MaterialImpact[];
  forecast: ForecastData | null;
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
}

export interface CountryComparison {
  country: string;
  totalCostPerWp: number;
  deltaVsCheapest: number;
  deltaPct: number;
  isCheapest: boolean;
  stageBreakdown: StageBreakdown[];
}

export interface SolarCompareData {
  params: { countries: string[]; tech: string; year: number };
  cheapestCountry: string;
  cheapestCost: number;
  comparison: CountryComparison[];
  model: { version: string; asOf: string };
}

export interface HomePageData {
  materials: MaterialSummary[];
  featuredSolar: { country: string; tech: string; year: number; totalCostPerWp: number };
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
}

export interface WindPageData {
  params: { turbineType: string; year: number };
  model: {
    version: string; asOf: string; totalCostPerKw: number;
    referenceCapacityMW: number; bladeLengthM: number;
    hubHeightM: number; capacityFactorPct: number;
  };
  stageBreakdown: StageBreakdown[];
  materialImpacts: MaterialImpact[];
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
}

export interface BriefMover {
  material: string;
  name: string;
  priceDeltaPct: number;
  priceToday: number;
  priceYesterday: number;
  priceUnit: string;
  topImpact: { system: string; component: string; delta: number; costUnit: string; baselineCost: number };
  allImpacts: { system: string; component: string; delta: number; costUnit: string; baselineCost: number }[];
  coverageTier: string;
}

export interface BriefData {
  date: string;
  noData: boolean;
  degraded?: boolean;
  reason?: string;
  movers: BriefMover[];
  totalMovers?: number;
  meta: { liveMaterials: number; liveComparisons?: number; totalMaterials: number; snapshotDate?: string };
}

export interface LandedCostStage {
  stage: string;
  costPerWp: number;
}

export interface LandedCostRouteResult {
  params: { from: string; to: string; product: string; exw: number };
  model: {
    version: string; asOf: string; hsCode: string;
    source: string; confidence: string; notes: string;
    transitDays: { min: number; max: number };
  };
  breakdown: {
    exw: number; inlandFreight: number; portHandling: number; fob: number;
    oceanFreight: number; insurance: number; cif: number;
    customsDuty: number; antiDumping: number; countervailing: number;
    customsClearance: number; inlandDelivery: number; ddp: number;
  };
  waterfall: LandedCostStage[];
  summary: { totalAddersPerWp: number; ddpPremiumPct: number };
}

export interface LandedCostComparison {
  from: string; to: string; label: string; confidence: string;
  fob: number; cif: number; ddp: number; premiumPct: number;
  transitDays: { min: number; max: number };
}

export interface PolicyRegime {
  id: string;
  label: string;
  description: string;
}

export interface LandedCostPageData {
  selectedRoute: LandedCostRouteResult | null;
  comparison: LandedCostComparison[];
  routes: { from: string; to: string; label: string; confidence: string }[];
  regime: PolicyRegime;
  regimes: PolicyRegime[];
  deltaVsBaseline: { ddpAbs: number; ddpPct: number } | null;
}

export interface SolarImportTradeAdders {
  product: string;
  exportExw: number;
  fob: number;
  cif: number;
  ddp: number;
  tradeAdder: number;
}

export interface SolarImportScenario {
  scenario: string;
  label: string;
  totalCostPerWp: number;
  deltaVsDomestic: number;
  deltaPct: number;
  stageBreakdown: { stage: string; costPerWp: number }[];
  tradeAdders: SolarImportTradeAdders | null;
  mainDriver: string | null;
  driverDetail?: { manufacturingDelta: number; tradeBurden: number; netDelta: number };
}

export interface SolarImportPageData {
  params: { dest: string; source: string; tech: string; year: number; regime: string };
  baseline: { scenario: string; totalCostPerWp: number };
  scenarios: SolarImportScenario[];
  ranking: { cheapestScenario: string; previousCheapestScenario: string; rankingChanged: boolean };
  model: { solarModelVersion: string; tradeModelVersion: string };
  regime: PolicyRegime;
  regimes: PolicyRegime[];
}

export interface HistoryPoint {
  date: string;
  value: number;
  unit?: string;
  source?: string;
  coverageTier?: string;
}

export interface HistorySeries {
  slug?: string;
  name?: string;
  icon?: string;
  label?: string;
  unit: string;
  points: HistoryPoint[];
  latestValue: number;
  latestDate: string;
  changePctSinceStart: number;
}

export interface HistoryPageData {
  observedMaterials: Array<HistorySeries & { slug: string; name: string; icon: string }>;
  roadmapBenchmarks: Array<HistorySeries & { label: string }>;
  meta: {
    snapshotCount: number;
    historyStartDate: string | null;
    latestSnapshotDate: string | null;
    trackedMaterialCount: number;
    notes: { observed: string; roadmap: string };
  };
}

export interface CrossSystemImpact {
  system: string;
  component: string;
  baselineCost: number;
  costUnit: string;
  delta: number;
  usagePerUnit: number;
  usageUnit: string;
}

export interface MaterialDetailData {
  material: { slug: string; name: string; icon: string; category: string; coverageTier: string; unit: string; yahooSymbol: string | null };
  currentPrice: MaterialPrice | null;
  crossSystemImpact: CrossSystemImpact[];
  meta: { asOf: string };
}
