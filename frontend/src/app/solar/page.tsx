import { fetchSolarPage, fetchSolarCompare } from '@/lib/api';
import Link from 'next/link';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';
import SolarControls from '@/components/SolarControls';
import CountryComparisonPanel from '@/components/CountryComparisonPanel';
import ForecastOutlookCard from '@/components/ForecastOutlookCard';
import CostIndexCard from '@/components/CostIndexCard';
import SystemHistoryCard from '@/components/SystemHistoryCard';

export const revalidate = 60;

export default async function SolarPage({
  searchParams,
}: {
  searchParams: { country?: string; tech?: string; year?: string };
}) {
  const country = searchParams.country?.toUpperCase() || 'VN';
  const tech = searchParams.tech?.toLowerCase() || 'topcon';
  const year = parseInt(searchParams.year || '2025', 10);

  const ALL_COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
  const compareCountries = ALL_COUNTRIES.filter(c => c !== country);
  // Include current country + up to 5 others = max 6
  const comparisonList = [country, ...compareCountries].slice(0, 6);

  const [data, compareData] = await Promise.all([
    fetchSolarPage(country, tech, year),
    fetchSolarCompare(comparisonList, tech, year),
  ]);

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

      {/* Import Simulator CTA */}
      <Link href="/solar/import" className="block group">
        <div className="card-surface p-4 flex items-center justify-between group-hover:border-[var(--up)] transition-all" style={{ borderColor: 'rgba(52,199,89,0.2)', background: 'rgba(52,199,89,0.04)' }}>
          <div className="flex items-center gap-4">
            <span className="text-[32px]">🚢</span>
            <div>
              <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Import vs Domestic: Which Sourcing Strategy?
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Compare importing wafers, cells, or modules from China vs full domestic manufacturing
              </div>
            </div>
          </div>
          <svg className="w-5 h-5 opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--up)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Anatomy CTA */}
      <Link href="/solar/anatomy" className="block group">
        <div className="card-surface p-4 flex items-center justify-between group-hover:border-[var(--up)] transition-all" style={{ borderColor: 'rgba(52,199,89,0.2)', background: 'rgba(52,199,89,0.04)' }}>
          <div className="flex items-center gap-4">
            <span className="text-[32px]">☀️</span>
            <div>
              <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                What&apos;s Inside a Solar Panel?
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Explore layers, materials, supply chain &amp; interactive cost calculator
              </div>
            </div>
          </div>
          <svg className="w-5 h-5 opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--up)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Controls */}
      <SolarControls
        currentCountry={data.params.country}
        currentTech={data.params.tech}
        currentYear={data.params.year}
      />

      {/* Forecast Outlook */}
      {data.forecast && <ForecastOutlookCard forecast={data.forecast} />}

      {/* Mobile key stats */}
      <div className="card-surface p-3 sm:hidden">
        <div className="section-label mb-2">Key Stats</div>
        <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Model</div>
            <div className="font-mono">{data.model.version}</div>
          </div>
          <div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Live coverage</div>
            <div>{data.meta.liveCoveragePct}% live</div>
          </div>
          <div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>System cost</div>
            <div className="font-price">${data.model.totalCostPerWp.toFixed(3)}/Wp</div>
          </div>
          <div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Reference</div>
            <div>{data.meta.referenceCoveragePct}% reference</div>
          </div>
        </div>
      </div>

      <SystemHistoryCard
        title="Cost History & Outlook"
        subtitle="Modeled benchmark history for the selected country and technology. Future roadmap points are shown as a dashed line."
        data={data.history}
      />

      <CostIndexCard data={data.idiotIndex} />

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

      {/* Country Comparison */}
      <CountryComparisonPanel data={compareData} />

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
