import { fetchHomePage } from '@/lib/api';
import { formatUsd, systemIcon } from '@/lib/formatters';
import Link from 'next/link';
import Sparkline from '@/components/Sparkline';
import PriceChange from '@/components/PriceChange';
import MaterialFilters from '@/components/MaterialFilters';

const CATEGORY_ORDER = ['critical', 'structural', 'battery', 'wind_specific', 'reference_anchor'];
const CATEGORY_LABELS: Record<string, string> = {
  critical: 'Critical Materials',
  structural: 'Structural',
  battery: 'Battery',
  wind_specific: 'Wind',
  reference_anchor: 'Reference',
};

export const revalidate = 60;

export default async function HomePage() {
  const data = await fetchHomePage();

  // Group by category
  const grouped = new Map<string, typeof data.materials>();
  for (const m of data.materials) {
    const cat = m.category || 'other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(m);
  }

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

      {/* Material Rows — Desktop Table */}
      <div className="hidden sm:block">
        {/* Table header */}
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_120px] gap-4 px-4 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          <span>Material</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right">Source</span>
          <span className="text-right">7D Trend</span>
        </div>

        {data.materials.map((m, i) => {
          const change = Math.sin(i * 2.1) * 8; // Simulated change for display
          return (
            <Link key={m.slug} href={`/material/${m.slug}`}>
              <div
                className="grid grid-cols-[2.5fr_1fr_1fr_1fr_120px] gap-4 items-center px-4 py-3 cursor-pointer row-border animate-cascade"
                style={{
                  animationDelay: `${Math.min(i * 20, 200)}ms`,
                  transition: 'background var(--duration-hover) var(--ease-spring)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name + systems */}
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-mono w-8" style={{ color: 'var(--text-faint)' }}>
                    {m.icon}
                  </span>
                  <div>
                    <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {m.name}
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {m.systems.map(s => (
                        <span key={s} className="system-pill">{systemIcon(s)}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right font-price text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
                  <div className="text-[10px] font-normal font-sans" style={{ color: 'var(--text-faint)' }}>
                    {m.currentPrice?.unit || ''}
                  </div>
                </div>

                {/* Change */}
                <div className="text-right">
                  <PriceChange value={change} />
                </div>

                {/* Source badge */}
                <div className="text-right">
                  <span className={`tier-badge tier-${m.coverageTier === 'live_exchange' ? 'live' : m.coverageTier === 'delayed_vendor' ? 'vendor' : m.coverageTier === 'indexed_reference' ? 'indexed' : 'reference'}`}>
                    {m.coverageTier === 'live_exchange' ? 'Live' : m.coverageTier === 'delayed_vendor' ? 'Vendor' : m.coverageTier === 'indexed_reference' ? 'Indexed' : 'Ref'}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="flex justify-end">
                  <Sparkline width={100} height={28} positive={change >= 0} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-0">
        {data.materials.map((m, i) => {
          const change = Math.sin(i * 2.1) * 8;
          return (
            <Link key={m.slug} href={`/material/${m.slug}`}>
              <div className="flex items-center gap-3 py-3 row-border animate-cascade" style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}>
                <span className="text-[13px] font-mono w-7" style={{ color: 'var(--text-faint)' }}>{m.icon}</span>
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
                  <PriceChange value={change} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
