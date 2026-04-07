import { fetchLandedCostPage } from '@/lib/api';
import LandedCostControls from '@/components/LandedCostControls';
import LandedCostSummaryCard from '@/components/LandedCostSummaryCard';
import RouteComparisonTable from '@/components/RouteComparisonTable';
import PolicyRegimeControls from '@/components/PolicyRegimeControls';
import WaterfallChart from '@/components/WaterfallChart';
import CostIndexCard from '@/components/CostIndexCard';

export const revalidate = 60;

export default async function LandedCostPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; exw?: string; product?: string; regime?: string };
}) {
  const from = searchParams.from?.toUpperCase();
  const to = searchParams.to?.toUpperCase();
  const exw = parseFloat(searchParams.exw || '0.179');
  const product = searchParams.product || 'module';
  const regime = searchParams.regime || 'current';

  const data = await fetchLandedCostPage(from, to, exw, product, regime);
  const selected = data.selectedRoute;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-[22px] font-semibold tracking-tight">Landed Cost Simulator</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
          What does a solar module cost delivered to your market? Compare trade routes, tariffs, and logistics. EXW → FOB → CIF → DDP.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg text-[11px] leading-relaxed" style={{
        background: 'rgba(251,191,36,0.06)',
        borderLeft: '3px solid #fbbf24',
        color: 'var(--text-muted)'
      }}>
        Indicative trade-cost model based on published tariff schedules and freight indices. Not legal or customs advice.
        Actual rates vary by exporter, trade agreement eligibility, and customs classification.
        HS Code: 8541.43 (PV modules).
      </div>

      {/* Route presets + Policy regime */}
      <PolicyRegimeControls
        regimes={data.regimes}
        currentRegime={regime}
        currentFrom={from}
        currentTo={to}
      />

      {/* Policy delta badge */}
      {data.deltaVsBaseline && regime !== 'current' && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{
          background: data.deltaVsBaseline.ddpAbs > 0 ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)',
          border: `1px solid ${data.deltaVsBaseline.ddpAbs > 0 ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)'}`,
        }}>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Policy Impact:
          </span>
          <span className="font-price text-[14px] font-semibold" style={{
            color: data.deltaVsBaseline.ddpAbs > 0 ? 'var(--down, #ef4444)' : 'var(--up)'
          }}>
            {data.deltaVsBaseline.ddpAbs > 0 ? '+' : ''}{data.deltaVsBaseline.ddpPct.toFixed(1)}%
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            ({data.deltaVsBaseline.ddpAbs > 0 ? '+' : ''}${data.deltaVsBaseline.ddpAbs.toFixed(4)}/Wp vs current policy)
          </span>
        </div>
      )}

      {/* EXW Controls */}
      <LandedCostControls
        routes={data.routes}
        currentFrom={from}
        currentTo={to}
        currentExw={exw}
      />

      {/* Selected route detail */}
      {selected && (
        <>
          {/* DDP headline */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[15px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {selected.params.from} → {selected.params.to}
              </div>
            </div>
          <div className="text-right">
            <div className="font-price text-[32px] font-bold tracking-tight" style={{ color: 'var(--up)' }}>
              ${selected.breakdown.ddp.toFixed(3)}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                DDP $/Wp &middot; +{selected.summary.ddpPremiumPct.toFixed(1)}% over EXW
            </div>
          </div>
        </div>

          {data.idiotIndex && <CostIndexCard data={data.idiotIndex} />}

          {/* Summary card */}
          <LandedCostSummaryCard result={selected} />

          {/* Waterfall */}
          <WaterfallChart
            stages={selected.waterfall.map(s => ({
              stage: s.stage,
              costPerWp: s.costPerWp,
              components: {},
            }))}
            totalCost={selected.breakdown.ddp}
            costUnit="$/Wp"
          />
        </>
      )}

      {/* Comparison table (always shown) */}
      <RouteComparisonTable comparison={data.comparison} exw={exw} />

      {/* Assumptions block */}
      <div className="card-surface p-4">
        <div className="section-label mb-3">Assumptions &amp; Sources</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <div>
            <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tariff Data</div>
            <ul className="space-y-0.5">
              <li>US: Section 301 (50%) + reciprocal tariffs (10-46%)</li>
              <li>India: BCD 20% + AIDC 20% = 40% effective</li>
              <li>EU: 0% MFN (no AD/CVD since 2018)</li>
              <li>Vietnam: 0% under ACFTA</li>
              <li>Australia: 0% under ChAFTA</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Freight &amp; Logistics</div>
            <ul className="space-y-0.5">
              <li>Ocean freight: Freightos/Sino-Shipping indices (March 2026)</li>
              <li>Insurance: 0.3% of CIF value (IRENA standard)</li>
              <li>40ft container: ~500 kW capacity</li>
              <li>VAT/GST excluded (reclaimable for businesses)</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 pt-2 text-[10px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}>
          Sources: USTR, Norton Rose Fulbright, India Union Budget 2025, EU TARIC, ChAFTA, ACFTA, Freightos, IRENA Solar PV Supply Chain Cost Tool 2026
        </div>
      </div>
    </div>
  );
}
