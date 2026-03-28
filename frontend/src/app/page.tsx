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
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Raw Materials Dashboard</h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          {data.materials.length} materials tracked across solar PV, battery storage, and wind systems.
          Live coverage: {data.meta.liveCoveragePct}% | Reference: {data.meta.referenceCoveragePct}%
        </p>
      </div>

      {/* Featured Solar */}
      <Link href="/solar" className="block">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-primary-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Featured: Solar PV Module Cost</div>
              <div className="text-2xl font-bold text-primary-400 mt-1">
                ${data.featuredSolar.totalCostPerWp.toFixed(3)}/Wp
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.featuredSolar.country} / {data.featuredSolar.tech.toUpperCase()} / {data.featuredSolar.year}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              View full model &rarr;
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
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[cat] || cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {materials.map(m => {
                const badge = tierBadge(m.coverageTier);
                return (
                  <Link key={m.slug} href={`/material/${m.slug}`}>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors h-full">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.icon}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {m.currentPrice ? formatUsd(m.currentPrice.value) : '---'}
                        <span className="text-xs text-gray-500 font-normal ml-1">
                          {m.currentPrice?.unit || ''}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {m.systems.map(s => (
                          <span key={s} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">
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
