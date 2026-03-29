'use client';

import type { ForecastData } from '@/lib/types';

const MATERIAL_LABELS: Record<string, string> = {
  silver: 'Silver',
  copper: 'Copper',
  aluminum: 'Aluminum',
  silicon: 'Silicon',
  tin: 'Tin',
  steel: 'Steel',
  glass: 'Solar Glass',
  eva: 'EVA',
};

const INDICATOR_STYLES: Record<string, { bg: string; text: string }> = {
  Falling:         { bg: 'rgba(52,199,89,0.15)', text: 'var(--up)' },
  Stable:          { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-muted)' },
  Rising:          { bg: 'rgba(255,179,64,0.15)', text: '#ffb340' },
  'Strongly Rising': { bg: 'rgba(239,68,68,0.15)', text: 'var(--down, #ef4444)' },
};

const CONFIDENCE_DOT: Record<string, string> = {
  High: 'var(--up)',
  Medium: '#fbbf24',
  Low: 'var(--text-faint)',
};

interface Props {
  forecast: ForecastData;
  unit?: string;
}

export default function ForecastOutlookCard({ forecast, unit = '$/Wp' }: Props) {
  const { currentModeledCost, nowcastCost, forward30dCost, leadIndicator, topDrivers } = forecast;
  const indicatorStyle = INDICATOR_STYLES[leadIndicator.label] || INDICATOR_STYLES.Stable;

  const nowcastDelta = nowcastCost - currentModeledCost;
  const nowcastDeltaPct = currentModeledCost > 0
    ? ((nowcastDelta / currentModeledCost) * 100)
    : 0;

  const fwdDelta = forward30dCost - currentModeledCost;
  const fwdDeltaPct = currentModeledCost > 0
    ? ((fwdDelta / currentModeledCost) * 100)
    : 0;

  return (
    <div className="card-surface p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">Cost Outlook</div>
        <div className="flex items-center gap-2">
          {/* Confidence dot */}
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: CONFIDENCE_DOT[leadIndicator.confidence] }}
            title={`${leadIndicator.confidence} confidence`}
          />
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {leadIndicator.confidence} confidence
          </span>
        </div>
      </div>

      {/* Lead indicator badge */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-[13px] font-semibold px-2.5 py-1 rounded-md"
          style={{ background: indicatorStyle.bg, color: indicatorStyle.text }}
        >
          {leadIndicator.label}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          Expected lag: {leadIndicator.expectedLag}
        </span>
      </div>

      {/* 3-column cost strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Modeled */}
        <div>
          <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>
            IRENA Model
          </div>
          <div className="font-price text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            ${currentModeledCost.toFixed(3)}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{unit}</div>
        </div>

        {/* Nowcast */}
        <div>
          <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>
            Nowcast
          </div>
          <div className="font-price text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            ${nowcastCost.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono" style={{
            color: nowcastDelta > 0.0001 ? 'var(--down, #ef4444)' :
                   nowcastDelta < -0.0001 ? 'var(--up)' : 'var(--text-faint)'
          }}>
            {nowcastDelta >= 0 ? '+' : ''}{nowcastDeltaPct.toFixed(1)}%
          </div>
        </div>

        {/* 30-day */}
        <div>
          <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>
            30-Day Est.
          </div>
          <div className="font-price text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            ${forward30dCost.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono" style={{
            color: fwdDelta > 0.0001 ? 'var(--down, #ef4444)' :
                   fwdDelta < -0.0001 ? 'var(--up)' : 'var(--text-faint)'
          }}>
            {fwdDelta >= 0 ? '+' : ''}{fwdDeltaPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Top drivers */}
      {topDrivers.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
            Top Drivers
          </div>
          <div className="space-y-1.5">
            {topDrivers.map(driver => (
              <div key={driver.material} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-primary)' }}>
                    {MATERIAL_LABELS[driver.material] || driver.material}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {driver.weightPct}% of cost
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {driver.changePct !== null ? (
                    <span className="font-mono" style={{
                      color: driver.changePct > 0 ? 'var(--down, #ef4444)' :
                             driver.changePct < 0 ? 'var(--up)' : 'var(--text-muted)'
                    }}>
                      {driver.changePct > 0 ? '+' : ''}{driver.changePct.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-faint)' }}>—</span>
                  )}
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {driver.lagLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-3 pt-2 text-[10px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}>
        Estimate based on 5-day material price trends and IRENA pass-through assumptions. Not a price guarantee.
      </div>
    </div>
  );
}
