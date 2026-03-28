'use client';

import type { StageBreakdown } from '@/lib/types';

const STAGE_CONFIG: Record<string, { color: string; border: string }> = {
  polysilicon: { color: 'text-green-400', border: 'border-green-500/40' },
  wafer: { color: 'text-blue-400', border: 'border-blue-500/40' },
  cell: { color: 'text-yellow-400', border: 'border-yellow-500/40' },
  module: { color: 'text-purple-400', border: 'border-purple-500/40' },
};

interface Props {
  stages: StageBreakdown[];
  totalCost: number;
}

export default function StageDetailCards({ stages, totalCost }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map(stage => {
        const pct = ((stage.costPerWp / totalCost) * 100).toFixed(1);
        const config = STAGE_CONFIG[stage.stage] || { color: 'text-gray-400', border: 'border-gray-700' };

        return (
          <div key={stage.stage} className={`card ${config.border} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-semibold capitalize ${config.color}`}>{stage.stage}</h4>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{pct}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono mb-4">${stage.costPerWp.toFixed(4)}</div>
            <div className="space-y-1.5">
              {Object.entries(stage.components)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([name, value]) => {
                  const compPct = ((value / stage.costPerWp) * 100);
                  return (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-gray-400 capitalize">{name}</span>
                          <span className="text-gray-300 font-mono">${value.toFixed(4)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${config.border.replace('border-', 'bg-').replace('/40', '/60')}`}
                            style={{ width: `${Math.min(compPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
