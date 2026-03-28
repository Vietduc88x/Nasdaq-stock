import type { HomePageData, SolarPageData, MaterialDetailData } from './types';

// Server-side (build/SSR) needs absolute URL; client-side uses relative (rewrite handles it)
const BASE = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://market-api.techmadeeasy.info')
  : '';

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

export async function fetchMaterialDetail(slug: string): Promise<MaterialDetailData> {
  const res = await fetch(`${BASE}/api/page/material/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Material detail fetch failed: ${res.status}`);
  return res.json();
}
