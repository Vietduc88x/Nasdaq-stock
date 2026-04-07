import Link from 'next/link';
import { fetchHistoryPage } from '@/lib/api';
import TrendLineChart from '@/components/TrendLineChart';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

function formatValue(value: number, unit: string) {
  const digits = unit === '$/kW' ? 0 : 3;
  return `${value.toFixed(digits)} ${unit}`;
}

function changeColor(changePct: number) {
  if (changePct > 0) return 'var(--up)';
  if (changePct < 0) return 'var(--down, #ef4444)';
  return 'var(--text-muted)';
}

export default async function HistoryPage() {
  const data = await fetchHistoryPage();

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="text-[22px] font-semibold tracking-tight">Historical Intelligence</h1>
        <p className="text-[13px] mt-1 max-w-3xl" style={{ color: 'var(--text-tertiary)' }}>
          Observed daily material snapshots on top, modeled cost roadmaps below. This keeps collected market history separate
          from benchmark projections so the page stays honest about what is measured versus modeled.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-surface p-4">
          <div className="section-label mb-1">Observed Snapshots</div>
          <div className="font-price text-[24px] font-semibold">{data.meta.snapshotCount}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            From {data.meta.historyStartDate || 'n/a'} to {data.meta.latestSnapshotDate || 'n/a'}
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="section-label mb-1">Tracked Materials</div>
          <div className="font-price text-[24px] font-semibold">{data.meta.trackedMaterialCount}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Live-traded inputs with persisted snapshot history
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="section-label mb-1">Roadmap Benchmarks</div>
          <div className="font-price text-[24px] font-semibold">{data.roadmapBenchmarks.length}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Solar, BESS, wind, and trade benchmark trackers
          </div>
        </div>
      </div>

      <div className="card-surface p-4">
        <div className="section-label mb-3">Observed Market Snapshot History</div>
        <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
          {data.meta.notes.observed}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.observedMaterials.map(material => (
            <div key={material.slug} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/material/${material.slug}`} className="text-[15px] font-medium hover:underline">
                    <span className="mr-2" style={{ color: 'var(--accent-green)' }}>{material.icon}</span>
                    {material.name}
                  </Link>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Latest snapshot: {material.latestDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-price text-[18px] font-semibold">
                    {formatValue(material.latestValue, material.unit)}
                  </div>
                  <div className="text-[11px]" style={{ color: changeColor(material.changePctSinceStart) }}>
                    {material.changePctSinceStart > 0 ? '+' : ''}{material.changePctSinceStart.toFixed(1)}% since start
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <TrendLineChart points={material.points} />
              </div>
              <div className="mt-2 flex justify-between text-[10px]" style={{ color: 'var(--text-faint)' }}>
                <span>{material.points[0]?.date}</span>
                <span>{material.points[material.points.length - 1]?.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-4">
        <div className="section-label mb-3">Modeled Cost Roadmaps</div>
        <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
          {data.meta.notes.roadmap}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.roadmapBenchmarks.map(series => (
            <div key={series.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-medium">{series.label}</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Latest benchmark year: {series.latestDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-price text-[18px] font-semibold">
                    {formatValue(series.latestValue, series.unit)}
                  </div>
                  <div className="text-[11px]" style={{ color: changeColor(series.changePctSinceStart) }}>
                    {series.changePctSinceStart > 0 ? '+' : ''}{series.changePctSinceStart.toFixed(1)}% vs first point
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <TrendLineChart points={series.points} stroke="var(--accent-blue, #60a5fa)" />
              </div>
              <div className="mt-2 flex justify-between text-[10px]" style={{ color: 'var(--text-faint)' }}>
                <span>{series.points[0]?.date}</span>
                <span>{series.points[series.points.length - 1]?.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
