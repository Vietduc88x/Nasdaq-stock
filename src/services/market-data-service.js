import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catalog = JSON.parse(
  readFileSync(join(__dirname, '../data/materials/catalog.json'), 'utf-8')
);

// In-memory cache: slug -> { data, timestamp }
const priceCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Yahoo Finance returns different units per symbol — convert to catalog unit
const YAHOO_CONVERSIONS = {
  'ALI=F': { divisor: 2204.62, note: 'LME $/metric ton → $/lb' },
  'ZN=F':  { divisor: 100, note: 'cents/lb → $/lb' },
};

/**
 * Fetch price + change + sparkline from Yahoo Finance.
 * Returns { price, previousClose, change24hPct, sparkline5d }
 */
async function fetchYahooData(yahooSymbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`;

  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (!resp.ok) {
    throw new Error(`Yahoo returned ${resp.status} for ${yahooSymbol}`);
  }

  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  if (!result?.meta?.regularMarketPrice) {
    throw new Error('No price in Yahoo response');
  }

  let price = result.meta.regularMarketPrice;
  let previousClose = result.meta.chartPreviousClose || price;

  // Apply unit conversion if needed
  const conv = YAHOO_CONVERSIONS[yahooSymbol];
  if (conv) {
    price = price / conv.divisor;
    previousClose = previousClose / conv.divisor;
  }

  const change24hPct = previousClose > 0
    ? ((price - previousClose) / previousClose) * 100
    : 0;

  // Extract 5-day closes for sparkline
  const closes = result.indicators?.quote?.[0]?.close || [];
  const sparkline5d = closes
    .filter(c => c !== null && c !== undefined)
    .map(c => conv ? c / conv.divisor : c);

  return { price, previousClose, change24hPct, sparkline5d };
}

/**
 * Fetch historical series from Yahoo Finance.
 * Returns [{ date, value }] in the material's native unit after conversion.
 */
export async function fetchYahooHistory(yahooSymbol, range = '5d') {
  const rangeConfig = {
    '5d': { range: '5d', interval: '1d' },
    '1mo': { range: '1mo', interval: '1d' },
    '3mo': { range: '3mo', interval: '1d' },
    '1y': { range: '1y', interval: '1wk' },
    'max': { range: 'max', interval: '1mo' },
  };

  const config = rangeConfig[range];
  if (!config) {
    throw new RangeError(`Unsupported Yahoo range: ${range}`);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${config.interval}&range=${config.range}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (!resp.ok) {
    throw new Error(`Yahoo returned ${resp.status} for ${yahooSymbol}`);
  }

  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];

  if (!timestamps.length || !closes.length) {
    throw new Error('No history in Yahoo response');
  }

  const conv = YAHOO_CONVERSIONS[yahooSymbol];
  return timestamps
    .map((timestamp, index) => {
      const close = closes[index];
      if (close === null || close === undefined) return null;
      const value = conv ? close / conv.divisor : close;
      return {
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        value: Math.round(value * 10000) / 10000,
      };
    })
    .filter(Boolean);
}

/**
 * Get current price for a material slug.
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
      source: cached.data.source === 'yahoo' ? 'cache' : cached.data.source,
      staleAfterSeconds: Math.round((CACHE_TTL_MS - (now - cached.timestamp)) / 1000),
      fallbackUsed: false
    };
  }

  // Try live fetch for exchange-traded materials
  if (material.yahooSymbol && material.coverageTier === 'live_exchange') {
    try {
      const yahoo = await fetchYahooData(material.yahooSymbol);
      const normalized = yahoo.price * material.conversionFactor;

      const result = {
        value: Math.round(yahoo.price * 10000) / 10000,
        unit: material.unit,
        normalizedValue: Math.round(normalized * 100000) / 100000,
        normalizedUnit: material.normalizedUnit,
        coverageTier: material.coverageTier,
        source: 'yahoo',
        asOf: new Date().toISOString(),
        staleAfterSeconds: Math.round(CACHE_TTL_MS / 1000),
        fallbackUsed: false,
        change24hPct: Math.round(yahoo.change24hPct * 100) / 100,
        previousClose: Math.round(yahoo.previousClose * 10000) / 10000,
        sparkline5d: yahoo.sparkline5d.map(v => Math.round(v * 10000) / 10000),
      };

      priceCache.set(slug, { data: result, timestamp: now });
      return result;
    } catch (err) {
      // Fall through to stale cache or fallback
      if (cached) {
        return {
          ...cached.data,
          source: 'stale_cache',
          coverageTier: 'stale_cache',
          staleAfterSeconds: 0,
          fallbackUsed: true
        };
      }
    }
  }

  // Return reference/fallback price
  // IMPORTANT: override coverageTier to 'modeled_reference' when falling back,
  // even if the material is normally live_exchange. The UI badge must reflect
  // the actual price state, not the material's potential capability.
  const normalized = material.fallbackPrice * material.conversionFactor;
  const isLiveMaterialFallingBack = material.coverageTier === 'live_exchange';
  return {
    value: material.fallbackPrice,
    unit: material.unit,
    normalizedValue: Math.round(normalized * 100000) / 100000,
    normalizedUnit: material.normalizedUnit,
    coverageTier: isLiveMaterialFallingBack ? 'fallback_reference' : material.coverageTier,
    source: 'reference',
    asOf: null,
    staleAfterSeconds: null,
    fallbackUsed: material.coverageTier === 'live_exchange',
    change24hPct: null,
    previousClose: null,
    sparkline5d: null,
  };
}

/**
 * Get prices for all materials.
 */
export async function getAllPrices() {
  const results = [];
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
