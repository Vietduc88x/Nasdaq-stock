import { fetchSolarPage } from '@/lib/api';
import Link from 'next/link';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';
import SolarControls from '@/components/SolarControls';

export const revalidate = 60;

export default async function SolarPage({
  searchParams,
}: {
  searchParams: { country?: string; tech?: string; year?: string };
}) {
  const country = searchParams.country?.toUpperCase() || 'VN';
  const tech = searchParams.tech?.toLowerCase() || 'topcon';
  const year = parseInt(searchParams.year || '2025', 10);

  const data = await fetchSolarPage(country, tech, year);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Solar PV Module Cost</h1>
          <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--text-faint)' }}>
            {data.model.version}
          </p>
        </div>
        <div className="text-right">
          <div className="font-price text-[32px] font-bold tracking-tight" style={{ color: 'var(--up)' }}>
            ${data.model.totalCostPerWp.toFixed(3)}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            USD per Watt-peak
          </div>
        </div>
      </div>

      {/* Sub-nav: Anatomy link */}
      <Link href="/solar/anatomy" className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
        <span>☀️</span> What&apos;s inside a solar panel? — Anatomy &amp; Cost Calculator
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>

      {/* Controls */}
      <SolarControls
        currentCountry={data.params.country}
        currentTech={data.params.tech}
        currentYear={data.params.year}
      />

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
      <WaterfallChart stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />

      {/* Stage Cards */}
      <div>
        <div className="section-label mb-3">Stage Breakdown</div>
        <StageDetailCards stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />
      </div>

      {/* Material Table */}
      <MaterialBreakdownTable materials={data.materialImpacts} totalCost={data.model.totalCostPerWp} />
    </div>
  );
}
