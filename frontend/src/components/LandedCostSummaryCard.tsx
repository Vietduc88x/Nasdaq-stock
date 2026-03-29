'use client';

import type { LandedCostRouteResult } from '@/lib/types';

interface Props {
  result: LandedCostRouteResult;
}

export default function LandedCostSummaryCard({ result }: Props) {
  const { breakdown, summary, model } = result;

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">Cost Summary</div>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: model.confidence === 'high' ? 'var(--up)' :
                          model.confidence === 'medium' ? '#fbbf24' : 'var(--down, #ef4444)'
            }}
          />
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            {model.confidence} confidence
          </span>
        </div>
      </div>

      {/* 4-column milestone strip */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'EXW', value: breakdown.exw, sub: 'Factory gate' },
          { label: 'FOB', value: breakdown.fob, sub: 'Free on board' },
          { label: 'CIF', value: breakdown.cif, sub: 'Cost+insurance+freight' },
          { label: 'DDP', value: breakdown.ddp, sub: 'Delivered duty paid' },
        ].map(m => (
          <div key={m.label}>
            <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>
              {m.label}
            </div>
            <div className="font-price text-[18px] font-bold" style={{
              color: m.label === 'DDP' ? 'var(--up)' : 'var(--text-primary)'
            }}>
              ${m.value.toFixed(3)}
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Premium */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Total adders: <span className="font-price font-medium" style={{ color: 'var(--text-primary)' }}>
            ${summary.totalAddersPerWp.toFixed(4)}/Wp
          </span>
        </span>
        <span className="font-price text-[12px] font-medium px-2 py-0.5 rounded" style={{
          background: summary.ddpPremiumPct > 30 ? 'rgba(255,59,48,0.12)' :
                      summary.ddpPremiumPct > 10 ? 'rgba(251,191,36,0.12)' : 'rgba(52,199,89,0.12)',
          color: summary.ddpPremiumPct > 30 ? 'var(--down, #ef4444)' :
                 summary.ddpPremiumPct > 10 ? '#fbbf24' : 'var(--up)'
        }}>
          +{summary.ddpPremiumPct.toFixed(1)}% over EXW
        </span>
      </div>

      {/* Route details */}
      <div className="space-y-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <div>HS Code: <span className="font-price">{model.hsCode}</span></div>
        <div>Transit: {model.transitDays.min}-{model.transitDays.max} days</div>
        <div>Assumptions as of: {model.asOf}</div>
      </div>

      {/* Notes */}
      <div className="mt-3 pt-2 text-[10px] leading-relaxed" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}>
        {model.notes}
      </div>
    </div>
  );
}
