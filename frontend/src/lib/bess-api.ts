export interface BessPageData {
  params: { chemistry: string; year: number };
  model: { version: string; costingMethod: string; asOf: string; totalCostPerKwh: number };
  stageBreakdown: { stage: string; costPerKwh: number; components: Record<string, number> }[];
  materialImpacts: {
    material: string;
    name: string;
    icon: string;
    coverageTier: string;
    priceSource: string;
    asOf: string | null;
    currentPrice: { value: number; unit: string } | null;
    baselineCost: number;
    costUnit: string;
    component: string;
  }[];
  meta: { freshness: string; liveCoveragePct: number; referenceCoveragePct: number };
}

const BASE = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://market-api.techmadeeasy.info')
  : '';

export async function fetchBessPage(chemistry = 'lfp', year = 2025): Promise<BessPageData> {
  const res = await fetch(
    `${BASE}/api/page/bess?chemistry=${chemistry}&year=${year}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`BESS page fetch failed: ${res.status}`);
  return res.json();
}
