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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Material Cost Breakdown
        </h3>
        <span className="text-xs text-gray-500">
          Materials: {materialPct}% of total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="text-left py-2 pr-3">Material</th>
              <th className="text-left py-2 pr-3">Source</th>
              <th className="text-right py-2 pr-3">Live Price</th>
              <th className="text-right py-2 pr-3">$/Wp</th>
              <th className="text-right py-2 pr-3">% of Total</th>
              <th className="text-right py-2">+10% Impact</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const badge = tierBadge(m.coverageTier);
              return (
                <tr key={m.material} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 pr-3">
                    <Link href={`/material/${m.material}`} className="text-white hover:text-primary-400 transition-colors">
                      <span className="text-gray-500 mr-1">{m.icon}</span>
                      {m.name}
                    </Link>
                    <div className="text-[10px] text-gray-600">{m.component}</div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right text-gray-300 font-mono text-xs">
                    {m.currentPrice ? `${formatUsd(m.currentPrice.value)} ${m.currentPrice.unit}` : '---'}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-white font-mono">
                    ${m.baselineContributionPerWp.toFixed(4)}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-gray-400">
                    {m.shareOfSystemPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs text-yellow-400">
                    +${m.impactPer10Pct.toFixed(5)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-700 font-semibold">
              <td colSpan={3} className="py-2 text-gray-400">Total Materials</td>
              <td className="py-2 text-right text-white font-mono">${totalMaterialCost.toFixed(4)}</td>
              <td className="py-2 text-right text-gray-400">{materialPct}%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
