'use client';

import type { MaterialImpact } from '@/lib/types';
import { tierBadge, formatUsd } from '@/lib/formatters';
import Link from 'next/link';

interface Props {
  materials: MaterialImpact[];
  totalCost: number;
}

export default function MaterialBreakdownTable({ materials, totalCost }: Props) {
  const totalMaterialCost = materials.reduce((s, m) => s + m.baselineContributionPerWp, 0);
  const materialPct = ((totalMaterialCost / totalCost) * 100).toFixed(1);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Material Cost Breakdown
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Materials = <span className="text-white font-semibold">{materialPct}%</span> of module cost
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800">
              <th className="text-left py-3 pr-3 font-medium">Material</th>
              <th className="text-left py-3 pr-3 font-medium">Source</th>
              <th className="text-right py-3 pr-3 font-medium">Price</th>
              <th className="text-right py-3 pr-3 font-medium">$/Wp</th>
              <th className="text-right py-3 pr-3 font-medium">Share</th>
              <th className="text-right py-3 font-medium">+10% Impact</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const badge = tierBadge(m.coverageTier);
              const barWidth = Math.max(2, (m.shareOfSystemPct / Math.max(...materials.map(x => x.shareOfSystemPct))) * 100);
              return (
                <tr key={m.material} className="border-b border-gray-800/30 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-3">
                    <Link href={`/material/${m.material}`} className="group">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs font-mono w-6">{m.icon}</span>
                        <div>
                          <div className="text-white font-medium group-hover:text-primary-400 transition-colors">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-gray-600 mt-0.5">{m.component}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`badge ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right text-gray-300 font-mono text-xs">
                    {m.currentPrice ? `${formatUsd(m.currentPrice.value)}` : '---'}
                    <div className="text-[10px] text-gray-600">{m.currentPrice?.unit || ''}</div>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="text-white font-mono text-sm">${m.baselineContributionPerWp.toFixed(4)}</div>
                    <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                      <div className="bg-primary-500/50 h-1 rounded-full" style={{ width: `${barWidth}%` }} />
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right text-gray-400 text-sm">
                    {m.shareOfSystemPct.toFixed(1)}%
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-mono text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                      +${m.impactPer10Pct.toFixed(5)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-700">
              <td colSpan={3} className="py-3 text-gray-400 font-semibold text-sm">Total Materials</td>
              <td className="py-3 text-right text-white font-mono font-semibold">${totalMaterialCost.toFixed(4)}</td>
              <td className="py-3 text-right text-white font-semibold">{materialPct}%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
