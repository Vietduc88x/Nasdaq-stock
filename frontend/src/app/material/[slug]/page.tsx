import { fetchMaterialDetail } from '@/lib/api';
import { tierBadge, formatUsd, systemIcon } from '@/lib/formatters';
import Link from 'next/link';

export const revalidate = 60;

export default async function MaterialDetailPage({ params }: { params: { slug: string } }) {
  const data = await fetchMaterialDetail(params.slug);
  const badge = tierBadge(data.material.coverageTier);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        &larr; Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl text-gray-500">{data.material.icon}</span>
            <h1 className="text-2xl font-bold">{data.material.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1 capitalize">{data.material.category.replace('_', ' ')}</p>
        </div>
        {data.currentPrice && (
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatUsd(data.currentPrice.value)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.currentPrice.unit} &middot; via {data.currentPrice.source}
            </div>
            {data.currentPrice.asOf && (
              <div className="text-[10px] text-gray-600 mt-0.5">
                as of {new Date(data.currentPrice.asOf).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cross-System Impact */}
      {data.crossSystemImpact.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Cross-System Impact (+10% price change)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.crossSystemImpact.map((impact, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{systemIcon(impact.system)}</span>
                  <span className="font-semibold text-white capitalize">{impact.system}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">{impact.component}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Baseline cost</span>
                    <span className="text-white font-mono">
                      {formatUsd(impact.baselineCost)} {impact.costUnit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usage</span>
                    <span className="text-gray-300 font-mono">
                      {impact.usagePerUnit} {impact.usageUnit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                    <span className="text-gray-400">+10% impact</span>
                    <span className="text-yellow-400 font-mono font-semibold">
                      +{formatUsd(impact.delta)} {impact.costUnit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.crossSystemImpact.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
          This material is tracked as a reference anchor and is not directly used in any system cost model.
        </div>
      )}
    </div>
  );
}
