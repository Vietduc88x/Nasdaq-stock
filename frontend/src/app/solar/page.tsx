import { fetchSolarPage } from '@/lib/api';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solar PV Module Cost</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bottom-up cost model
            <span className="text-gray-600 mx-1.5">&middot;</span>
            <span className="font-mono text-gray-500">{data.model.version}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-primary-400 font-mono tracking-tight">
            ${data.model.totalCostPerWp.toFixed(3)}
          </div>
          <div className="text-sm text-gray-500 mt-1">USD per Watt-peak</div>
        </div>
      </div>

      {/* Interactive Controls */}
      <SolarControls
        currentCountry={data.params.country}
        currentTech={data.params.tech}
        currentYear={data.params.year}
      />

      {/* Freshness */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`w-2 h-2 rounded-full ${
          data.meta.freshness === 'fresh' ? 'bg-green-500' :
          data.meta.freshness === 'mixed' ? 'bg-yellow-500' : 'bg-gray-500'
        }`} />
        <span>
          Data: {data.meta.liveCoveragePct}% live, {data.meta.referenceCoveragePct}% reference
        </span>
      </div>

      {/* Waterfall Chart */}
      <WaterfallChart stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />

      {/* Stage Detail Cards */}
      <div>
        <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Stage Breakdown
        </h2>
        <StageDetailCards stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />
      </div>

      {/* Material Breakdown Table */}
      <MaterialBreakdownTable materials={data.materialImpacts} totalCost={data.model.totalCostPerWp} />
    </div>
  );
}
