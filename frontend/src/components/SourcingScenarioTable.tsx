'use client';

import type { SolarImportScenario } from '@/lib/types';

interface Props {
  scenarios: SolarImportScenario[];
}

export default function SourcingScenarioTable({ scenarios }: Props) {
  const cheapest = Math.min(...scenarios.map(s => s.totalCostPerWp));

  return (
    <div className="card-surface p-4">
      <div className="section-label mb-3">Sourcing Strategy Comparison</div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              <th className="text-left pb-2 pr-3">Strategy</th>
              <th className="text-right pb-2 pr-3">Final Cost</th>
              <th className="text-right pb-2 pr-3 hidden md:table-cell">Index</th>
              <th className="text-right pb-2 pr-3">vs Domestic</th>
              <th className="text-left pb-2 pr-3 hidden sm:table-cell">Main Driver</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => {
              const isCheapest = s.totalCostPerWp === cheapest;
              const isDomestic = s.scenario === 'domestic';

              return (
                <tr key={s.scenario} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {s.label}
                      </span>
                      {isCheapest && !isDomestic && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(52,199,89,0.15)', color: 'var(--up)' }}>
                          Cheapest
                        </span>
                      )}
                      {isDomestic && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          Baseline
                        </span>
                      )}
                    </div>
                    {s.tradeAdders && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        Import {s.tradeAdders.product} from China
                      </div>
                    )}
                  </td>
                  <td className="text-right py-3 pr-3 font-price font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${s.totalCostPerWp.toFixed(3)}/Wp
                  </td>
                  <td className="text-right py-3 pr-3 font-price hidden md:table-cell" style={{ color: 'var(--accent-gold)' }}>
                    {s.scenarioIndex?.multiplier ? `${s.scenarioIndex.multiplier.toFixed(1)}x` : '—'}
                  </td>
                  <td className="text-right py-3 pr-3 font-price" style={{
                    color: isDomestic ? 'var(--text-faint)' :
                           s.deltaVsDomestic < 0 ? 'var(--up)' : 'var(--down, #ef4444)'
                  }}>
                    {isDomestic ? '—' : `${s.deltaPct > 0 ? '+' : ''}${s.deltaPct.toFixed(1)}%`}
                  </td>
                  <td className="py-3 pr-3 hidden sm:table-cell text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {s.mainDriver || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
