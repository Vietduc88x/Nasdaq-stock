'use client';

import type { StageBreakdown } from '@/lib/types';

const STAGE_COLORS: Record<string, string> = {
  polysilicon: '#34C759',
  wafer: '#3B82F6',
  cell: '#FBBF24',
  module: '#A855F7',
};

interface Props {
  stages: StageBreakdown[];
  totalCost: number;
}

export default function StageDetailCards({ stages, totalCost }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map(stage => {
        const pct = ((stage.costPerWp / totalCost) * 100).toFixed(1);
        const color = STAGE_COLORS[stage.stage] || '#888';

        return (
          <div key={stage.stage} className="card-surface p-4" style={{ borderColor: `${color}20` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold capitalize" style={{ color }}>{stage.stage}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                {pct}%
              </span>
            </div>
            <div className="font-price text-[17px] font-bold mb-3">${stage.costPerWp.toFixed(4)}</div>
            <div className="space-y-1.5">
              {Object.entries(stage.components)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, value]) => {
                  const barPct = (value / stage.costPerWp) * 100;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span style={{ color: 'var(--text-muted)' }} className="capitalize">{name}</span>
                        <span className="font-price" style={{ color: 'var(--text-tertiary)' }}>${value.toFixed(4)}</span>
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
