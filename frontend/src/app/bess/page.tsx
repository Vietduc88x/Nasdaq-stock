import { fetchBessPage } from '@/lib/bess-api';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';
import BessControls from '@/components/BessControls';

export const revalidate = 60;

export default async function BessPage({
  searchParams,
}: {
  searchParams: { chemistry?: string; year?: string };
}) {
  const chemistry = searchParams.chemistry?.toLowerCase() || 'lfp';
  const year = parseInt(searchParams.year || '2025', 10);

  const data = await fetchBessPage(chemistry, year);

  const chemLabel = chemistry === 'nmc811' ? 'NMC811' : 'LFP';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Battery Energy Storage Cost</h1>
          <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--text-faint)' }}>
            {data.model.version} &middot; {data.model.costingMethod}
          </p>
        </div>
        <div className="text-right">
          <div className="font-price text-[32px] font-bold tracking-tight" style={{ color: 'var(--up)' }}>
            ${data.model.totalCostPerKwh.toFixed(0)}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            USD per kWh &middot; {chemLabel} pack
          </div>
        </div>
      </div>

      {/* Controls */}
      <BessControls currentChemistry={data.params.chemistry} currentYear={data.params.year} />

      {/* Freshness + provenance */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: data.meta.freshness === 'fresh' ? 'var(--up)' :
                        data.meta.freshness === 'mixed' ? '#fbbf24' : 'var(--text-faint)'
          }}
        />
        {data.meta.liveCoveragePct}% live &middot; {data.meta.referenceCoveragePct}% reference
        &middot; <span style={{ color: 'var(--accent-gold)' }}>Bottom-up engineering cost (not market selling price)</span>
      </div>

      {/* Waterfall Chart */}
      <WaterfallChart stages={data.stageBreakdown} totalCost={data.model.totalCostPerKwh} costUnit="$/kWh" />

      {/* Stage Cards */}
      <div>
        <div className="section-label mb-3">Stage Breakdown</div>
        <StageDetailCards stages={data.stageBreakdown} totalCost={data.model.totalCostPerKwh} costUnit="$/kWh" />
      </div>

      {/* Material Breakdown */}
      <MaterialBreakdownTable
        materials={data.materialImpacts as any}
        totalCost={data.model.totalCostPerKwh}
        costUnit="$/kWh"
        totalLabel="pack cost"
      />
    </div>
  );
}
