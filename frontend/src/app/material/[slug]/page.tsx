import { fetchMaterialDetail } from '@/lib/api';
import { formatUsd, systemIcon, resolveTier } from '@/lib/formatters';
import Link from 'next/link';
import MaterialIcon from '@/components/MaterialIcon';
import PriceChart from '@/components/PriceChart';

export const revalidate = 60;

export default async function MaterialDetailPage({ params }: { params: { slug: string } }) {
  const data = await fetchMaterialDetail(params.slug);

  // Badge reflects ACTUAL price state, not material capability
  const priceTier = data.currentPrice?.coverageTier || data.material.coverageTier;
  const { tierClass, tierLabel } = resolveTier(priceTier);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-[12px] transition-colors group" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Materials
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <MaterialIcon slug={params.slug} symbol={data.material.icon} size={40} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold">{data.material.name}</h1>
            <span className="text-[12px] font-mono" style={{ color: 'var(--text-faint)' }}>
              {data.material.icon}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
            <span className="text-[11px] capitalize" style={{ color: 'var(--text-faint)' }}>
              {data.material.category.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Price Chart — real data for live materials, message for reference */}
      <div className="card-surface p-5">
        <PriceChart
          yahooSymbol={data.material.yahooSymbol}
          name={data.material.slug}
          currentPrice={data.currentPrice?.value}
          unit={data.currentPrice?.unit}
          sparkline5d={data.currentPrice?.sparkline5d}
        />
      </div>

      {/* Price details */}
      {data.currentPrice && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-surface p-3">
            <div className="section-label mb-1">Price</div>
            <div className="font-price text-[15px] font-semibold">{formatUsd(data.currentPrice.value)}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{data.currentPrice.unit}</div>
          </div>
          <div className="card-surface p-3">
            <div className="section-label mb-1">Source</div>
            <div className="text-[13px] font-medium capitalize">{data.currentPrice.source}</div>
          </div>
          <div className="card-surface p-3">
            <div className="section-label mb-1">Coverage</div>
            <div><span className={`tier-badge ${tierClass}`}>{tierLabel}</span></div>
          </div>
          {data.currentPrice.asOf && (
            <div className="card-surface p-3">
              <div className="section-label mb-1">Last Updated</div>
              <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(data.currentPrice.asOf).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cross-System Impact */}
      {data.crossSystemImpact.length > 0 && (
        <div>
          <div className="section-label mb-3">Impact on Renewable Energy Systems (+10%)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.crossSystemImpact.map((impact, i) => (
              <div key={i} className="card-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{systemIcon(impact.system)}</span>
                  <span className="text-[14px] font-semibold capitalize">{impact.system}</span>
                </div>
                <p className="text-[11px] mb-3" style={{ color: 'var(--text-faint)' }}>{impact.component}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--text-muted)' }}>Baseline cost</span>
                    <span className="font-price">{formatUsd(impact.baselineCost)} <span style={{ color: 'var(--text-faint)' }}>{impact.costUnit}</span></span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--text-muted)' }}>Usage</span>
                    <span className="font-price" style={{ color: 'var(--text-tertiary)' }}>{impact.usagePerUnit.toLocaleString()} {impact.usageUnit}</span>
                  </div>
                  <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between text-[12px]">
                      <span style={{ color: 'var(--text-muted)' }}>+10% impact</span>
                      <span className="font-price font-semibold" style={{ color: 'var(--up)' }}>
                        +{formatUsd(impact.delta)} {impact.costUnit}
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
        <div className="card-surface p-8 text-center">
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Reference anchor — not directly modeled in system cost engines.
          </p>
        </div>
      )}
    </div>
  );
}
