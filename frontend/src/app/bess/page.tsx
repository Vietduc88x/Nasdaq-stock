import { fetchBessPage } from '@/lib/bess-api';
import Link from 'next/link';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';
import BessControls from '@/components/BessControls';
import CostIndexCard from '@/components/CostIndexCard';
import SystemHistoryCard from '@/components/SystemHistoryCard';

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

      {/* Anatomy CTA */}
      <Link href="/bess/anatomy" className="block group">
        <div className="card-surface p-4 flex items-center justify-between group-hover:border-[var(--up)] transition-all" style={{ borderColor: 'rgba(52,199,89,0.2)', background: 'rgba(52,199,89,0.04)' }}>
          <div className="flex items-center gap-4">
            <span className="text-[32px]">🔋</span>
            <div>
              <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                What&apos;s Inside a Battery Pack?
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Explore cathode chemistry, cell components, thermal management &amp; supply chain
              </div>
            </div>
          </div>
          <svg className="w-5 h-5 opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--up)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Controls */}
      <BessControls currentChemistry={data.params.chemistry} currentYear={data.params.year} />

      <SystemHistoryCard
        title="Cost History & Outlook"
        subtitle="Modeled benchmark history for the selected chemistry. Future roadmap points are shown as a dashed line."
        data={data.history}
      />

      <CostIndexCard data={data.idiotIndex} />

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
        materials={data.materialImpacts}
        totalCost={data.model.totalCostPerKwh}
        costUnit="$/kWh"
        totalLabel="pack cost"
      />
    </div>
  );
}
