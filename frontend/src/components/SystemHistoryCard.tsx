import type { HistorySeries } from '@/lib/types';
import TrendLineChart from '@/components/TrendLineChart';

function formatValue(value: number, unit: string) {
  const digits = unit === '$/kW' ? 0 : unit === '$/kWh' ? 0 : 3;
  return `${value.toFixed(digits)} ${unit}`;
}

function changeColor(changePct: number) {
  if (changePct > 0) return 'var(--up)';
  if (changePct < 0) return 'var(--down, #ef4444)';
  return 'var(--text-muted)';
}

export default function SystemHistoryCard({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: HistorySeries;
}) {
  const projectedCount = data.points.filter(point => point.projected).length;

  return (
    <div className="card-surface p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="section-label mb-1">{title}</div>
          <div className="text-[12px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        </div>
        <div className="text-right">
          <div className="font-price text-[22px] font-semibold">
            {formatValue(data.latestValue, data.unit)}
          </div>
          <div className="text-[11px]" style={{ color: changeColor(data.changePctSinceStart) }}>
            {data.changePctSinceStart > 0 ? '+' : ''}{data.changePctSinceStart.toFixed(1)}% vs {data.points[0]?.date}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <TrendLineChart points={data.points} height={132} stroke="var(--accent-blue, #60a5fa)" unit={data.unit} />
        <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-[10px]" style={{ color: 'var(--text-faint)' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-[2px]" style={{ background: 'var(--accent-blue, #60a5fa)' }} />
              <span>Historical benchmark</span>
            </div>
            {projectedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-4 h-[2px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to right, var(--accent-blue, #60a5fa) 0 6px, transparent 6px 10px)',
                  }}
                />
                <span>Predicted / roadmap</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
        Solid line shows modeled benchmark history up to the selected year. Dashed line shows roadmap or forecast points beyond the selected year.
      </div>
    </div>
  );
}
