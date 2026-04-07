import { describe, it, expect } from 'vitest';
import { getHistoryPageData } from '../services/history-service.js';

describe('history-service', () => {
  it('returns observed materials from persisted snapshots', () => {
    const data = getHistoryPageData();

    expect(data.observedMaterials.length).toBeGreaterThan(0);
    expect(data.meta.snapshotCount).toBeGreaterThan(0);
    expect(data.meta.historyStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.meta.latestSnapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns sorted material points with latest values', () => {
    const data = getHistoryPageData();
    const silver = data.observedMaterials.find(material => material.slug === 'silver');

    expect(silver).toBeDefined();
    expect(silver.points.length).toBeGreaterThan(0);
    expect(silver.points[0].date <= silver.points[silver.points.length - 1].date).toBe(true);
    expect(silver.latestValue).toBe(silver.points[silver.points.length - 1].value);
  });

  it('returns modeled roadmap benchmarks for solar, bess, wind, and trade', () => {
    const data = getHistoryPageData();

    expect(data.roadmapBenchmarks).toHaveLength(4);
    expect(data.roadmapBenchmarks.map(series => series.label)).toContain('Solar PV Module — Vietnam TOPCon');
    expect(data.roadmapBenchmarks.map(series => series.label)).toContain('BESS Pack — LFP');
    expect(data.roadmapBenchmarks.map(series => series.label)).toContain('Onshore Wind Turbine');
    expect(data.roadmapBenchmarks.map(series => series.label)).toContain('CN→US Module DDP — Current Policy');
  });

  it('roadmap series are positive and have change summaries', () => {
    const data = getHistoryPageData();

    for (const series of data.roadmapBenchmarks) {
      expect(series.points.length).toBeGreaterThan(1);
      series.points.forEach(point => {
        expect(point.value).toBeGreaterThan(0);
      });
      expect(typeof series.changePctSinceStart).toBe('number');
    }
  });
});
