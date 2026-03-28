'use client';

import type { SolarCompareData } from '@/lib/types';

const COUNTRY_LABELS: Record<string, string> = {
  CN: 'China',
  VN: 'Vietnam',
  IN: 'India',
  DE: 'Germany',
  US: 'United States',
  AU: 'Australia',
};

const STAGE_COLORS: Record<string, string> = {
  polysilicon: '#34C759',
  wafer: '#3B82F6',
  cell: '#FBBF24',
  module: '#A855F7',
};

interface Props {
  data: SolarCompareData;
}

export default function CountryComparisonPanel({ data }: Props) {
  const { comparison, cheapestCost } = data;

  // Find the max total for scaling bars
  const maxCost = Math.max(...comparison.map(c => c.totalCostPerWp));

  return (
    <div className="card-surface p-4">
      <div className="section-label mb-1">Country Comparison</div>
      <p className="text-[11px] mb-4" style={{ color: 'var(--text-faint)' }}>
        {data.params.tech.toUpperCase()} &middot; {data.params.year} &middot; {comparison.length} countries
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STAGE_COLORS).map(([stage, color]) => (
          <div key={stage} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {comparison.map(entry => {
          const barWidth = (entry.totalCostPerWp / maxCost) * 100;
          return (
            <div key={entry.country}>
              {/* Country label row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {COUNTRY_LABELS[entry.country] || entry.country}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {entry.country}
                  </span>
                  {entry.isCheapest && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(52,199,89,0.15)', color: 'var(--up)' }}
                    >
                      Lowest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-price text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${entry.totalCostPerWp.toFixed(3)}
                  </span>
                  {!entry.isCheapest && (
                    <span className="text-[11px] font-mono" style={{ color: 'var(--down, #ef4444)' }}>
                      +{entry.deltaPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stacked bar */}
              <div
                className="flex h-7 rounded overflow-hidden"
                style={{ width: `${barWidth}%`, minWidth: '60px' }}
              >
                {entry.stageBreakdown.map(stage => {
                  const stagePct = ((stage.costPerWp ?? 0) / entry.totalCostPerWp) * 100;
                  return (
                    <div
                      key={stage.stage}
                      className="relative group"
                      style={{
                        width: `${stagePct}%`,
                        background: STAGE_COLORS[stage.stage] || '#666',
                        opacity: 0.85,
                      }}
                      title={`${stage.stage}: $${(stage.costPerWp ?? 0).toFixed(4)}/Wp`}
                    />
                  );
                })}
              </div>

              {/* Delta bar (only for non-cheapest) */}
              {!entry.isCheapest && (
                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  +${entry.deltaVsCheapest.toFixed(4)}/Wp vs {COUNTRY_LABELS[data.cheapestCountry]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        className="mt-4 pt-3 text-[12px]"
        style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        Cheapest: <strong style={{ color: 'var(--up)' }}>{COUNTRY_LABELS[data.cheapestCountry]}</strong> at{' '}
        <span className="font-price font-semibold">${cheapestCost.toFixed(3)}/Wp</span>
        {comparison.length > 1 && (
          <>
            {' '}&middot; Spread: $
            {(Math.max(...comparison.map(c => c.totalCostPerWp)) - cheapestCost).toFixed(3)}/Wp
          </>
        )}
      </div>
    </div>
  );
}
