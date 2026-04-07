import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getMaterial } from './impact-service.js';
import { readSnapshot } from './brief-service.js';
import { fetchYahooHistory } from './market-data-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SNAPSHOTS_DIR = join(__dirname, '../data/snapshots');

const VALID_RANGES = ['5d', '1mo', '3mo', '1y', 'max'];

const RANGE_DAYS = {
  '5d': 5,
  '1mo': 31,
  '3mo': 93,
  '1y': 366,
  'max': Infinity,
};

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function getSnapshotDates() {
  try {
    return readdirSync(SNAPSHOTS_DIR)
      .filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .map(name => name.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

function filterDatesForRange(dates, range) {
  if (range === 'max') return dates;
  const windowDays = RANGE_DAYS[range] ?? 31;
  const latest = dates[dates.length - 1];
  if (!latest) return [];
  const latestMs = new Date(`${latest}T00:00:00Z`).getTime();
  return dates.filter(date => {
    const ms = new Date(`${date}T00:00:00Z`).getTime();
    return latestMs - ms <= windowDays * 86400000;
  });
}

function getSnapshotHistory(material, range) {
  const dates = filterDatesForRange(getSnapshotDates(), range);
  const points = dates
    .map(date => {
      const snapshot = readSnapshot(date);
      const entry = snapshot?.prices?.find(price => price.slug === material.slug);
      if (!entry || entry.value === null) return null;
      return {
        date,
        value: round4(entry.value),
      };
    })
    .filter(Boolean);

  return {
    slug: material.slug,
    name: material.name,
    range,
    unit: material.unit,
    sourceKind: points.length > 0 ? 'snapshot' : 'unavailable',
    points,
    note: points.length > 0
      ? 'Snapshot-based history from persisted daily prices.'
      : 'No persisted history available for this material yet.',
  };
}

export async function getMaterialHistory(slug, range = '5d') {
  if (!VALID_RANGES.includes(range)) {
    throw new RangeError(`Invalid range: ${range}. Valid: ${VALID_RANGES.join(', ')}`);
  }

  const material = getMaterial(slug);
  if (!material) {
    throw new RangeError(`Material not found: ${slug}`);
  }

  if (material.yahooSymbol && material.coverageTier === 'live_exchange') {
    try {
      const points = await fetchYahooHistory(material.yahooSymbol, range);
      return {
        slug: material.slug,
        name: material.name,
        range,
        unit: material.unit,
        sourceKind: 'yahoo',
        points,
        note: 'Real exchange-traded history from Yahoo Finance chart data.',
      };
    } catch {
      const snapshotHistory = getSnapshotHistory(material, range);
      return {
        ...snapshotHistory,
        sourceKind: snapshotHistory.points.length > 0 ? 'snapshot_fallback' : 'unavailable',
        note: snapshotHistory.points.length > 0
          ? 'Live market history unavailable, showing persisted daily snapshots instead.'
          : 'Live market history unavailable and no persisted snapshots exist for this material.',
      };
    }
  }

  return getSnapshotHistory(material, range === '5d' ? 'max' : range);
}

export function getValidHistoryRanges() {
  return VALID_RANGES;
}
