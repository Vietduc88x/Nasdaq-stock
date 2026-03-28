'use client';

import type { StageBreakdown } from '@/lib/types';

const STAGE_COLORS: Record<string, string> = {
  polysilicon: 'border-green-500/30',
  wafer: 'border-blue-500/30',
  cell: 'border-yellow-500/30',
  module: 'border-purple-500/30',
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
        const borderColor = STAGE_COLORS[stage.stage] || 'border-gray-700';

        return (
          <div key={stage.stage} className={`bg-gray-900 border ${borderColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white capitalize">{stage.stage}</h4>
              <span className="text-xs text-gray-500">{pct}%</span>
            </div>
            <div className="text-xl font-bold text-white mb-3">${stage.costPerWp.toFixed(4)}/Wp</div>
            <div className="space-y-1">
              {Object.entries(stage.components)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([name, value]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <span className="text-gray-500 capitalize">{name}</span>
                    <span className="text-gray-300 font-mono">${value.toFixed(4)}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
