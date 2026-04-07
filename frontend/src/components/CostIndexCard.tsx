'use client';

import { useState } from 'react';
import type { CostIndexData } from '@/lib/types';

function formatCost(value: number, unit: string) {
  const digits = unit === '$/Wp' ? 3 : 0;
  return `$${value.toFixed(digits)} ${unit.replace('$/', '/').replace('USD', '$')}`;
}

export default function CostIndexCard({ data }: { data: CostIndexData }) {
  const [tab, setTab] = useState<'summary' | 'bottomup'>('summary');
  const contributors = data.contributors || [];

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

      <div className="segmented-control">
        <button className={`segment ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>
          Summary
        </button>
        <button className={`segment ${tab === 'bottomup' ? 'active' : ''}`} onClick={() => setTab('bottomup')}>
          Bottom-Up
        </button>
      </div>

      {tab === 'summary' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
                {data.baseLabel || 'Base Cost'}
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
                {data.upliftLabel || 'Uplift Layer'}
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
        </>
      ) : (
        <div className="space-y-3">
          <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Base cost is estimated bottom-up as the sum of the major contributors below, then compared against finished cost.
          </div>
          <div className="rounded-lg p-3 font-mono text-[12px]" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
            {data.baseLabel || 'Base Cost'} = Σ contributor_i
          </div>
          <div className="space-y-2">
            {contributors.map((item) => (
              <div key={`${item.label}-${item.component || ''}`} className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                  {item.component && (
                    <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{item.component}</div>
                  )}
                </div>
                <div className="font-price text-[13px] font-semibold">{formatCost(item.value, data.unit)}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{data.baseLabel || 'Base Cost'}</span>
            <span className="font-price text-[14px] font-semibold">{formatCost(data.rawMaterialCost, data.unit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
