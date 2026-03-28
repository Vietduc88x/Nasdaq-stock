import { fetchHomePage } from '@/lib/api';
import { formatUsd, systemIcon } from '@/lib/formatters';
import Link from 'next/link';
import MaterialRow from '@/components/MaterialRow';
import MaterialIcon from '@/components/MaterialIcon';
import MaterialFilters from '@/components/MaterialFilters';

export const revalidate = 60;

export default async function HomePage() {
  const data = await fetchHomePage();
  const livePct = data.meta.liveCoveragePct;
  const totalMaterials = data.materials.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Renewable Energy Materials
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {totalMaterials} materials &middot; {livePct}% live coverage
          </p>
        </div>

        {/* Featured Solar CTA */}
        <Link href="/solar" className="group">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            <div>
              <div className="section-label">Solar PV Module</div>
              <div className="font-price text-[18px] font-semibold mt-0.5" style={{ color: 'var(--up)' }}>
                ${data.featuredSolar.totalCostPerWp.toFixed(3)}
                <span className="text-[12px] font-normal" style={{ color: 'var(--text-muted)' }}>/Wp</span>
              </div>
            </div>
            <svg className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <MaterialFilters />

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[2.5fr_1fr_0.8fr_0.6fr_100px] gap-4 px-4 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          <span>Material</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h</span>
          <span className="text-right">Source</span>
          <span className="text-right">5D</span>
        </div>

        {data.materials.map((m, i) => (
          <MaterialRow key={m.slug} material={m} index={i} />
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-0">
        {data.materials.map((m, i) => {
          return (
            <Link key={m.slug} href={`/material/${m.slug}`}>
              <div className="flex items-center gap-3 py-3 row-border animate-cascade" style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}>
                <MaterialIcon slug={m.slug} symbol={m.icon} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium">{m.name}</div>
                  <div className="flex gap-1 mt-0.5">
                    {m.systems.map(s => (
                      <span key={s} className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{systemIcon(s)} {s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-price text-[16px] font-semibold">
                    {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {m.currentPrice?.unit || ''}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
