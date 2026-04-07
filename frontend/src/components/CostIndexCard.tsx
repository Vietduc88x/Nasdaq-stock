import type { CostIndexData } from '@/lib/types';

function formatCost(value: number, unit: string) {
  const digits = unit === '$/Wp' ? 3 : 0;
  return `$${value.toFixed(digits)} ${unit.replace('$/', '/').replace('USD', '$')}`;
}

export default function CostIndexCard({ data }: { data: CostIndexData }) {
  return (
    <div className="card-surface p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="section-label mb-1">{data.title}</div>
          <div className="text-[12px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {data.explanation}
          </div>
        </div>
        <div className="text-right">
          <div className="font-price text-[28px] font-bold tracking-tight" style={{ color: 'var(--accent-gold)' }}>
            {data.multiplier ? `${data.multiplier.toFixed(1)}x` : '—'}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            finished cost / base cost
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
            Base Cost
          </div>
          <div className="font-price text-[15px] font-semibold">{formatCost(data.rawMaterialCost, data.unit)}</div>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
            Finished Cost
          </div>
          <div className="font-price text-[15px] font-semibold">{formatCost(data.finishedCost, data.unit)}</div>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
            Uplift Layer
          </div>
          <div className="font-price text-[15px] font-semibold">{formatCost(data.conversionCost, data.unit)}</div>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
            Base Share
          </div>
          <div className="font-price text-[15px] font-semibold">
            {data.rawSharePct !== null ? `${data.rawSharePct.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {data.topDriver && (
        <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Biggest driver:
          {' '}
          <span style={{ color: 'var(--text-primary)' }}>{data.topDriver.label}</span>
          {data.topDriver.component ? ` — ${data.topDriver.component}` : ''}
          {' '}
          <span className="font-price" style={{ color: 'var(--accent-gold)' }}>
            ({formatCost(data.topDriver.value, data.unit)})
          </span>
        </div>
      )}
    </div>
  );
}
