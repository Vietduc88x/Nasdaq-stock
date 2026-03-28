import { fetchSolarPage } from '@/lib/api';
import WaterfallChart from '@/components/WaterfallChart';
import MaterialBreakdownTable from '@/components/MaterialBreakdownTable';
import StageDetailCards from '@/components/StageDetailCards';

export const revalidate = 60;

export default async function SolarPage() {
  const data = await fetchSolarPage('VN', 'topcon', 2025);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Solar PV Module Cost Model</h1>
          <p className="text-gray-400 text-sm mt-1">
            IRENA-based bottom-up cost model &middot; {data.model.version}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-400">
            ${data.model.totalCostPerWp.toFixed(3)}/Wp
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {data.params.country} / {data.params.tech.toUpperCase()} / {data.params.year}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        {['topcon', 'mono'].map(t => (
          <span key={t} className={`px-3 py-1.5 rounded-md text-sm border ${
            t === data.params.tech
              ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
              : 'bg-gray-900 border-gray-700 text-gray-500'
          }`}>
            {t.toUpperCase()}
          </span>
        ))}
        <span className="text-gray-600 mx-1">|</span>
        {['CN', 'VN', 'IN', 'DE', 'US', 'AU'].map(c => (
          <span key={c} className={`px-3 py-1.5 rounded-md text-sm border ${
            c === data.params.country
              ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
              : 'bg-gray-900 border-gray-700 text-gray-500'
          }`}>
            {c}
          </span>
        ))}
      </div>

      {/* Freshness indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`w-2 h-2 rounded-full ${
          data.meta.freshness === 'fresh' ? 'bg-green-500' :
          data.meta.freshness === 'mixed' ? 'bg-yellow-500' : 'bg-gray-500'
        }`} />
        Data freshness: {data.meta.freshness} &middot;
        Live: {data.meta.liveCoveragePct}% &middot;
        Reference: {data.meta.referenceCoveragePct}%
      </div>

      {/* Waterfall Chart */}
      <WaterfallChart stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />

      {/* Stage Detail Cards */}
      <StageDetailCards stages={data.stageBreakdown} totalCost={data.model.totalCostPerWp} />

      {/* Material Breakdown Table */}
      <MaterialBreakdownTable materials={data.materialImpacts} totalCost={data.model.totalCostPerWp} />
    </div>
  );
}
