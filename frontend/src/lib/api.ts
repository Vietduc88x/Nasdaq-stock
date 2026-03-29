import type { HomePageData, SolarPageData, SolarCompareData, WindPageData, BriefData, LandedCostPageData, MaterialDetailData } from './types';

// Server-side (build/SSR) needs absolute URL; client-side uses relative (rewrite handles it)
const BASE = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://market-api.techmadeeasy.info')
  : '';

export async function fetchBrief(): Promise<BriefData> {
  const res = await fetch(`${BASE}/api/page/brief`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Brief fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchHomePage(): Promise<HomePageData> {
  const res = await fetch(`${BASE}/api/page/home`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Home page fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchSolarPage(
  country = 'VN',
  tech = 'topcon',
  year = 2025
): Promise<SolarPageData> {
  const res = await fetch(
    `${BASE}/api/page/solar?country=${country}&tech=${tech}&year=${year}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Solar page fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchSolarCompare(
  countries: string[] = ['VN', 'CN', 'IN'],
  tech = 'topcon',
  year = 2025
): Promise<SolarCompareData> {
  const res = await fetch(
    `${BASE}/api/page/solar-compare?countries=${countries.join(',')}&tech=${tech}&year=${year}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Solar compare fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchWindPage(
  turbineType = 'onshore',
  year = 2025
): Promise<WindPageData> {
  const res = await fetch(
    `${BASE}/api/page/wind?turbineType=${turbineType}&year=${year}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Wind page fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchLandedCostPage(
  from?: string,
  to?: string,
  exw = 0.179,
  product = 'module'
): Promise<LandedCostPageData> {
  const params = new URLSearchParams({ exw: String(exw), product });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${BASE}/api/page/landed-cost?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Landed cost fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchMaterialDetail(slug: string): Promise<MaterialDetailData> {
  const res = await fetch(`${BASE}/api/page/material/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Material detail fetch failed: ${res.status}`);
  return res.json();
}
