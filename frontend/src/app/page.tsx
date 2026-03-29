import { fetchHomePage, fetchBrief } from '@/lib/api';
import Link from 'next/link';
import MorningBriefCard from '@/components/MorningBriefCard';
import MaterialList from '@/components/MaterialList';

export const revalidate = 60;

export default async function HomePage() {
  const [data, brief] = await Promise.all([fetchHomePage(), fetchBrief()]);
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

      {/* Morning Brief */}
      <MorningBriefCard brief={brief} />

      {/* Filterable Material List */}
      <MaterialList materials={data.materials} />
    </div>
  );
}
