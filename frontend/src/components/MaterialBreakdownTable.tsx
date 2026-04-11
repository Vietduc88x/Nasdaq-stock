'use client';

import type { MaterialImpact } from '@/lib/types';
import { formatUsd, resolveTier } from '@/lib/formatters';
import Link from 'next/link';

interface Props {
  materials: MaterialImpact[];
  totalCost: number;
  costUnit?: string;   // '$/Wp' or '$/kWh'
  totalLabel?: string; // 'module cost' or 'pack cost'
  summaryNote?: string;
}

// Helper to get cost from either solar or BESS material impact shape
function getMaterialCost(m: MaterialImpact): number {
  return m.baselineContributionPerWp ?? m.baselineCost ?? 0;
}

function getMaterialShare(m: MaterialImpact, totalCost: number): number {
  return m.shareOfSystemPct ?? ((getMaterialCost(m) / totalCost) * 100);
}

export default function MaterialBreakdownTable({ materials, totalCost, costUnit = '$/Wp', totalLabel = 'system cost', summaryNote }: Props) {
  const isKwh = costUnit === '$/kWh';
  const decimals = isKwh ? 2 : 4;
  const totalMaterialCost = materials.reduce((s, m) => s + getMaterialCost(m), 0);
  const materialPct = ((totalMaterialCost / totalCost) * 100).toFixed(1);
  const maxShare = Math.max(...materials.map(m => getMaterialShare(m, totalCost)));

  // Use shared resolveTier for enum completeness (handles stale_cache, fallback_reference)

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="section-label">Material Breakdown</div>
        <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {materialPct}% of {totalLabel}
        </span>
      </div>
      {summaryNote && (
        <div className="text-[11px] mb-3" style={{ color: 'var(--text-faint)' }}>
          {summaryNote}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              <th className="text-left pb-2 pr-3">Material</th>
              <th className="text-right pb-2 pr-3 hidden sm:table-cell">Source</th>
              <th className="text-right pb-2 pr-3">Price</th>
              <th className="text-right pb-2 pr-3">{costUnit}</th>
              <th className="text-right pb-2 pr-3">Share</th>
              <th className="text-right pb-2">+10%</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const share = getMaterialShare(m, totalCost);
              const cost = getMaterialCost(m);
              const barWidth = (share / maxShare) * 100;
              return (
                <tr key={m.material} className="row-border group" style={{ transition: 'background var(--duration-hover)' }}>
                  <td className="py-2.5 pr-3">
                    <Link href={`/material/${m.material}`} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono w-5" style={{ color: 'var(--text-faint)' }}>{m.icon}</span>
                      <div>
                        <div className="text-[13px] font-medium group-hover:underline" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                        <div className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{m.component}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-right hidden sm:table-cell">
                    {(() => { const t = resolveTier(m.coverageTier); return <span className={`tier-badge ${t.tierClass}`}>{t.tierLabel}</span>; })()}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-price text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    <div className="font-price text-[13px] font-medium">${cost.toFixed(decimals)}</div>
                    <div className="w-full h-0.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-0.5 rounded-full" style={{ width: `${barWidth}%`, background: 'var(--up)', opacity: 0.4 }} />
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    {share.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right font-price text-[11px] font-medium" style={{ color: 'var(--up)' }}>
                    +${(cost * 0.1).toFixed(isKwh ? 3 : 5)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid var(--border-default)' }}>
              <td colSpan={3} className="pt-2.5 text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>Total Materials</td>
              <td className="pt-2.5 text-right font-price text-[13px] font-semibold">${totalMaterialCost.toFixed(decimals)}</td>
              <td className="pt-2.5 text-right text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>{materialPct}%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
