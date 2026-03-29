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
