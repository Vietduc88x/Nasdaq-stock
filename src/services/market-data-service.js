import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catalog = JSON.parse(
  readFileSync(join(__dirname, '../data/materials/catalog.json'), 'utf-8')
);

// In-memory cache: symbol -> { value, unit, asOf, source }
const priceCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch a single price from Yahoo Finance.
 */
async function fetchYahooPrice(yahooSymbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`Yahoo returned ${resp.status}`);
    }

    const data = await resp.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (price === undefined || price === null) {
      throw new Error('No price in Yahoo response');
    }

    return price;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Get current price for a material slug.
 * Returns { value, unit, normalizedValue, normalizedUnit, coverageTier, source, asOf, staleAfterSeconds, fallbackUsed }
 */
export async function getPrice(slug) {
  const material = catalog.materials.find(m => m.slug === slug);
  if (!material) return null;

  // Check cache first
  const cached = priceCache.get(slug);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return {
      ...cached.data,
      source: 'cache',
      staleAfterSeconds: Math.round((CACHE_TTL_MS - (now - cached.timestamp)) / 1000),
      fallbackUsed: false
    };
  }

  // Try live fetch for exchange-traded materials
  if (material.yahooSymbol && material.coverageTier === 'live_exchange') {
    try {
      const price = await fetchYahooPrice(material.yahooSymbol);
      const normalized = price * material.conversionFactor;

      const result = {
        value: price,
        unit: material.unit,
        normalizedValue: Math.round(normalized * 100000) / 100000,
        normalizedUnit: material.normalizedUnit,
        coverageTier: material.coverageTier,
        source: 'yahoo',
        asOf: new Date().toISOString(),
        staleAfterSeconds: Math.round(CACHE_TTL_MS / 1000),
        fallbackUsed: false
      };

      priceCache.set(slug, { data: result, timestamp: now });
      return result;
    } catch (err) {
      // Fall through to stale cache or fallback
      if (cached) {
        return {
          ...cached.data,
          source: 'stale_cache',
          staleAfterSeconds: 0,
          fallbackUsed: false
        };
      }
    }
  }

  // Return reference/fallback price
  const normalized = material.fallbackPrice * material.conversionFactor;
  return {
    value: material.fallbackPrice,
    unit: material.unit,
    normalizedValue: Math.round(normalized * 100000) / 100000,
    normalizedUnit: material.normalizedUnit,
    coverageTier: material.coverageTier,
    source: 'reference',
    asOf: null,
    staleAfterSeconds: null,
    fallbackUsed: material.coverageTier === 'live_exchange'
  };
}

/**
 * Get prices for all materials.
 */
export async function getAllPrices() {
  const results = [];
  // Fetch live materials in parallel, reference materials synchronously
  const livePromises = [];

  for (const material of catalog.materials) {
    if (material.yahooSymbol && material.coverageTier === 'live_exchange') {
      livePromises.push(getPrice(material.slug).then(p => ({ slug: material.slug, price: p })));
    } else {
      results.push({ slug: material.slug, price: await getPrice(material.slug) });
    }
  }

  const liveResults = await Promise.allSettled(livePromises);
  for (const result of liveResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  }

  return results;
}

/**
 * Get cache status for health check.
 */
export function getCacheStatus() {
  const now = Date.now();
  let live = 0, stale = 0, missing = 0;

  for (const material of catalog.materials) {
    const cached = priceCache.get(material.slug);
    if (!cached) { missing++; continue; }
    if ((now - cached.timestamp) < CACHE_TTL_MS) { live++; } else { stale++; }
  }

  return { live, stale, missing, total: catalog.materials.length };
}
