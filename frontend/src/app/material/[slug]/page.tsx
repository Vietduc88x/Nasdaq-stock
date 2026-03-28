import { fetchMaterialDetail } from '@/lib/api';
import { tierBadge, formatUsd, systemIcon } from '@/lib/formatters';
import Link from 'next/link';

export const revalidate = 60;

export default async function MaterialDetailPage({ params }: { params: { slug: string } }) {
  const data = await fetchMaterialDetail(params.slug);
  const badge = tierBadge(data.material.coverageTier);

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-mono text-sm font-bold">
                {data.material.icon}
              </span>
              <div>
                <h1 className="text-2xl font-bold">{data.material.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${badge.color}`}>{badge.label}</span>
                  <span className="text-xs text-gray-600 capitalize">{data.material.category.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>
          {data.currentPrice && (
            <div className="text-right">
              <div className="text-3xl font-bold text-white font-mono">
                {formatUsd(data.currentPrice.value)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.currentPrice.unit}
                <span className="text-gray-600 mx-1">&middot;</span>
                via {data.currentPrice.source}
              </div>
              {data.currentPrice.asOf && (
                <div className="text-[11px] text-gray-600 mt-1">
                  {new Date(data.currentPrice.asOf).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cross-System Impact */}
      {data.crossSystemImpact.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Cross-System Impact (+10% price change)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.crossSystemImpact.map((impact, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl">{systemIcon(impact.system)}</span>
                  <span className="font-semibold text-white capitalize text-lg">{impact.system}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{impact.component}</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Baseline cost</span>
                    <span className="text-white font-mono">
                      {formatUsd(impact.baselineCost)}
                      <span className="text-gray-500 text-xs ml-1">{impact.costUnit}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usage</span>
                    <span className="text-gray-300 font-mono">
                      {impact.usagePerUnit.toLocaleString()}
                      <span className="text-gray-500 text-xs ml-1">{impact.usageUnit}</span>
                    </span>
                  </div>
                  <div className="border-t border-gray-800 pt-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">+10% impact</span>
                      <span className="font-mono font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                        +{formatUsd(impact.delta)}
                        <span className="text-yellow-500/70 text-xs ml-1">{impact.costUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.crossSystemImpact.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-gray-500 text-lg mb-2">Reference Material</div>
          <p className="text-gray-600 text-sm">
            This material is tracked as a market reference anchor and is not directly modeled in any system cost engine.
          </p>
        </div>
      )}
    </div>
  );
}
