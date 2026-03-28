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
  costPerWp: number;
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
  baselineContributionPerWp: number;
  shareOfSystemPct: number;
  impactPer10Pct: number;
  component: string;
}

export interface SolarPageData {
  params: { country: string; tech: string; year: number };
  model: { version: string; asOf: string; totalCostPerWp: number };
  stageBreakdown: StageBreakdown[];
  materialImpacts: MaterialImpact[];
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
}

export interface HomePageData {
  materials: MaterialSummary[];
  featuredSolar: { country: string; tech: string; year: number; totalCostPerWp: number };
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
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
