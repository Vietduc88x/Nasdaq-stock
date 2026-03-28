import { fetchHomePage } from '@/lib/api';
import { tierBadge, systemIcon, formatUsd } from '@/lib/formatters';
import Link from 'next/link';

const CATEGORY_ORDER = ['critical', 'structural', 'battery', 'wind_specific', 'reference_anchor'];
const CATEGORY_LABELS: Record<string, string> = {
  critical: 'Critical Materials',
  structural: 'Structural Materials',
  battery: 'Battery Materials',
  wind_specific: 'Wind-Specific',
  reference_anchor: 'Reference',
};

export const revalidate = 60;

export default async function HomePage() {
  const data = await fetchHomePage();
  const grouped = new Map<string, typeof data.materials>();

  for (const m of data.materials) {
    const cat = m.category || 'other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(m);
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Raw Materials Dashboard</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Tracking {data.materials.length} renewable energy materials across solar PV, battery storage, and wind systems.
        </p>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Live: {data.meta.liveCoveragePct}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            Reference: {data.meta.referenceCoveragePct}%
          </span>
        </div>
      </div>

      {/* Featured Solar */}
      <Link href="/solar" className="block group">
        <div className="card p-5 group-hover:border-primary-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">Solar PV Module Cost</div>
              <div className="text-3xl font-bold text-primary-400 mt-2 font-mono">
                ${data.featuredSolar.totalCostPerWp.toFixed(3)}
                <span className="text-lg text-gray-500 font-sans">/Wp</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex gap-2">
                <span className="bg-gray-800 px-2 py-0.5 rounded">{data.featuredSolar.country}</span>
                <span className="bg-gray-800 px-2 py-0.5 rounded">{data.featuredSolar.tech.toUpperCase()}</span>
                <span className="bg-gray-800 px-2 py-0.5 rounded">{data.featuredSolar.year}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 group-hover:text-primary-400 transition-colors flex items-center gap-1">
              View model
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Material Groups */}
      {CATEGORY_ORDER.map(cat => {
        const materials = grouped.get(cat);
        if (!materials?.length) return null;

        return (
          <section key={cat}>
            <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {CATEGORY_LABELS[cat] || cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {materials.map(m => {
                const badge = tierBadge(m.coverageTier);
                return (
                  <Link key={m.slug} href={`/material/${m.slug}`} className="group">
                    <div className="card-hover p-4 h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {m.name}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">{m.icon}</div>
                        </div>
                        <span className={`badge ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {m.currentPrice ? formatUsd(m.currentPrice.value) : '---'}
                        <span className="text-[11px] text-gray-500 font-sans font-normal ml-1.5">
                          {m.currentPrice?.unit || ''}
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        {m.systems.map(s => (
                          <span key={s} className="text-[11px] bg-gray-800/80 px-2 py-0.5 rounded-full text-gray-400">
                            {systemIcon(s)} {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
