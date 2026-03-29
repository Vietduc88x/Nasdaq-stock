'use client';

import type { LandedCostComparison } from '@/lib/types';

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'var(--up)',
  medium: '#fbbf24',
  low: 'var(--down, #ef4444)',
};

interface Props {
  comparison: LandedCostComparison[];
  exw: number;
}

export default function RouteComparisonTable({ comparison, exw }: Props) {
  const cheapest = comparison.length > 0 ? comparison[0].ddp : exw;

  return (
    <div className="card-surface p-4">
      <div className="section-label mb-3">Route Comparison</div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              <th className="text-left pb-2 pr-3">Route</th>
              <th className="text-right pb-2 pr-3">FOB</th>
              <th className="text-right pb-2 pr-3">CIF</th>
              <th className="text-right pb-2 pr-3">DDP</th>
              <th className="text-right pb-2 pr-3">Premium</th>
              <th className="text-right pb-2 pr-3 hidden sm:table-cell">Transit</th>
              <th className="text-right pb-2">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((r, i) => {
              const isCheapest = r.ddp === cheapest;
              return (
                <tr key={`${r.from}-${r.to}`} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {r.from}→{r.to}
                      </span>
                      {isCheapest && (
                        <span
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(52,199,89,0.15)', color: 'var(--up)' }}
                        >
                          Cheapest
                        </span>
                      )}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{r.label}</div>
                  </td>
                  <td className="text-right py-2.5 pr-3 font-price" style={{ color: 'var(--text-secondary)' }}>
                    ${r.fob.toFixed(3)}
                  </td>
                  <td className="text-right py-2.5 pr-3 font-price" style={{ color: 'var(--text-secondary)' }}>
                    ${r.cif.toFixed(3)}
                  </td>
                  <td className="text-right py-2.5 pr-3 font-price font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${r.ddp.toFixed(3)}
                  </td>
                  <td className="text-right py-2.5 pr-3 font-price" style={{
                    color: r.premiumPct > 30 ? 'var(--down, #ef4444)' :
                           r.premiumPct > 10 ? '#fbbf24' : 'var(--up)'
                  }}>
                    +{r.premiumPct.toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 pr-3 hidden sm:table-cell text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {r.transitDays.min}-{r.transitDays.max}d
                  </td>
                  <td className="text-right py-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: CONFIDENCE_COLORS[r.confidence] || 'var(--text-faint)' }}
                      title={`${r.confidence} confidence`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
