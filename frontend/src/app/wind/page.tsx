import { fetchWindPage } from '@/lib/api';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';
import WindControls from '@/components/WindControls';

export const revalidate = 60;

export default async function WindPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = parseInt(searchParams.year || '2025', 10);

  const data = await fetchWindPage('onshore', year);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Onshore Wind Turbine Cost</h1>
          <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--text-faint)' }}>
            {data.model.version} &middot; {data.model.referenceCapacityMW}MW reference
          </p>
        </div>
        <div className="text-right">
          <div className="font-price text-[32px] font-bold tracking-tight" style={{ color: 'var(--up)' }}>
            ${data.model.totalCostPerKw.toFixed(0)}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            USD per kW installed
          </div>
        </div>
      </div>

      {/* Turbine specs */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Blade Length', value: `${data.model.bladeLengthM}m` },
          { label: 'Hub Height', value: `${data.model.hubHeightM}m` },
          { label: 'Capacity Factor', value: `${data.model.capacityFactorPct}%` },
        ].map(spec => (
          <div key={spec.label} className="card-surface px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              {spec.label}
            </div>
            <div className="font-price text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {spec.value}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <WindControls currentYear={data.params.year} />

      {/* Freshness */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: data.meta.freshness === 'fresh' ? 'var(--up)' :
                        data.meta.freshness === 'mixed' ? '#fbbf24' : 'var(--text-faint)'
          }}
        />
        {data.meta.liveCoveragePct}% live &middot; {data.meta.referenceCoveragePct}% reference
      </div>

      {/* Waterfall Chart */}
      <WaterfallChart stages={data.stageBreakdown} totalCost={data.model.totalCostPerKw} costUnit="$/kW" />

      {/* Stage Cards */}
      <div>
        <div className="section-label mb-3">Stage Breakdown</div>
        <StageDetailCards stages={data.stageBreakdown} totalCost={data.model.totalCostPerKw} costUnit="$/kW" />
      </div>

      {/* Material Table */}
      <MaterialBreakdownTable
        materials={data.materialImpacts}
        totalCost={data.model.totalCostPerKw}
        costUnit="$/kW"
        totalLabel="Total Installed Cost"
      />
    </div>
  );
}
