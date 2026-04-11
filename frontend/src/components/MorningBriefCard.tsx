'use client';

import type { BriefData } from '@/lib/types';
import Link from 'next/link';

const SYSTEM_LABELS: Record<string, string> = {
  solar: 'Solar PV',
  bess: 'BESS',
  wind: 'Wind',
};

interface Props {
  brief: BriefData;
}

export default function MorningBriefCard({ brief }: Props) {
  if (brief.noData) {
    return (
      <div className="card-surface p-4">
        <div className="section-label mb-2">Morning Brief</div>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          No prior snapshot available yet. We publish a daily movers brief once enough live prices are captured.
        </p>
        <div className="mt-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          Next update: tomorrow morning (local time).
        </div>
        <div className="mt-3">
          <Link href="/history" className="text-[12px] font-medium hover:underline" style={{ color: 'var(--accent-gold)' }}>
            See recent material history instead
          </Link>
        </div>
      </div>
    );
  }

  if (brief.movers.length === 0) {
    const isDegraded = 'degraded' in brief && brief.degraded;
    return (
      <div className="card-surface p-4">
        <div className="section-label mb-2">Morning Brief</div>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {isDegraded
            ? 'Comparison data unavailable — insufficient live pricing for reliable movers.'
            : 'No significant material price moves today.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">Morning Brief</div>
        <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
          {brief.meta.liveMaterials} live &middot; vs {brief.meta.snapshotDate}
        </div>
      </div>

      <div className="space-y-2.5">
        {brief.movers.map(mover => {
          const isUp = mover.priceDeltaPct > 0;
          const impactIsUp = mover.topImpact.delta > 0;

          return (
            <div key={mover.material} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={`/material/${mover.material}`}
                  className="text-[13px] font-medium truncate hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {mover.name}
                </Link>
                <span
                  className="font-price text-[12px] font-medium shrink-0"
                  style={{ color: isUp ? 'var(--down, #ef4444)' : 'var(--up)' }}
                >
                  {isUp ? '+' : ''}{mover.priceDeltaPct.toFixed(1)}%
                </span>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="font-price text-[12px]" style={{
                  color: impactIsUp ? 'var(--down, #ef4444)' : 'var(--up)'
                }}>
                  {impactIsUp ? '+' : ''}{formatDelta(mover.topImpact.delta, mover.topImpact.costUnit)}
                </span>
                <span className="text-[10px] ml-1" style={{ color: 'var(--text-faint)' }}>
                  {SYSTEM_LABELS[mover.topImpact.system] || mover.topImpact.system}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {brief.totalMovers && brief.totalMovers > 5 && (
        <div className="text-[11px] mt-2" style={{ color: 'var(--text-faint)' }}>
          +{brief.totalMovers - 5} more movers
        </div>
      )}
    </div>
  );
}

function formatDelta(delta: number, costUnit: string): string {
  if (costUnit === 'USD/Wp') return `$${Math.abs(delta).toFixed(5)}/Wp`;
  if (costUnit === 'USD/kWh') return `$${Math.abs(delta).toFixed(3)}/kWh`;
  if (costUnit === 'USD/kW') return `$${Math.abs(delta).toFixed(1)}/kW`;
  return `$${Math.abs(delta).toFixed(4)}`;
}
