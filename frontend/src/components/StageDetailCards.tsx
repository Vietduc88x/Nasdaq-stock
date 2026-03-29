'use client';

import type { StageBreakdown } from '@/lib/types';

const DEFAULT_COLORS: Record<string, string> = {
  // Solar
  polysilicon: '#34C759', wafer: '#3B82F6', cell: '#FBBF24', module: '#A855F7',
  // BESS
  cathode: '#ef4444', anode: '#f59e0b', cellComponents: '#3b82f6', cellAssembly: '#8b5cf6', pack: '#22c55e',
  // Wind
  blade: '#34C759', nacelle: '#3B82F6', tower: '#FBBF24', electrical: '#A855F7', installation: '#ec4899',
};

interface Props {
  stages: StageBreakdown[];
  totalCost: number;
  costUnit?: string; // '$/Wp' or '$/kWh'
}

function getStageCost(stage: StageBreakdown): number {
  return stage.costPerWp ?? stage.costPerKwh ?? stage.costPerKw ?? 0;
}

export default function StageDetailCards({ stages, totalCost, costUnit = '$/Wp' }: Props) {
  return (
    <div className={`grid grid-cols-2 ${stages.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3`}>
      {stages.map(stage => {
        const cost = getStageCost(stage);
        const pct = ((cost / totalCost) * 100).toFixed(1);
        const color = DEFAULT_COLORS[stage.stage] || '#888';

        return (
          <div key={stage.stage} className="card-surface p-4" style={{ borderColor: `${color}20` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold capitalize" style={{ color }}>{stage.stage.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                {pct}%
              </span>
            </div>
            <div className="font-price text-[17px] font-bold mb-3">
              ${cost.toFixed(costUnit === '$/Wp' ? 4 : 1)}
            </div>
            <div className="space-y-1.5">
              {Object.entries(stage.components)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, value]) => {
                  const barPct = (value / cost) * 100;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span style={{ color: 'var(--text-muted)' }} className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-price" style={{ color: 'var(--text-tertiary)' }}>${value.toFixed(costUnit === '$/Wp' ? 4 : 1)}</span>
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-1 rounded-full" style={{ width: `${Math.min(barPct, 100)}%`, background: `${color}60` }} />
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
