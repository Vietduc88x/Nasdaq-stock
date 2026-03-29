'use client';

import { useState } from 'react';
import Link from 'next/link';
import TurbineExplodedView from '@/components/wind/TurbineExplodedView';
import WindSupplyChainFlow from '@/components/wind/WindSupplyChainFlow';

export default function WindAnatomyPage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pt-2">
        <Link href="/wind" className="inline-flex items-center gap-1 text-[12px] mb-4 group" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Wind Cost Model
        </Link>
        <h1 className="text-[26px] font-semibold tracking-tight">What&apos;s Inside a Wind Turbine?</h1>
        <p className="text-[14px] mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Explore the components, materials, and costs of a 3MW onshore wind turbine.
          From carbon fiber blades to 85-ton steel towers — every part that determines $/kW installed.
        </p>
      </div>

      {/* Exploded View */}
      <TurbineExplodedView activeLayer={activeLayer} onLayerSelect={setActiveLayer} />

      {/* Supply Chain Flow */}
      <div>
        <h2 className="text-[18px] font-semibold mb-4">Supply Chain: From Mine to Wind Farm</h2>
        <WindSupplyChainFlow />
      </div>

      {/* Scale Context */}
      <div>
        <h2 className="text-[18px] font-semibold mb-4">Scale: What Does a 3MW Turbine Look Like?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Hub Height', value: '100m', context: '= 30-story building' },
            { label: 'Rotor Diameter', value: '130m', context: '> wingspan of A380' },
            { label: 'Total Weight', value: '~400 tons', context: '= 300 cars' },
            { label: 'Annual Output', value: '~9.2 GWh', context: '= 2,500 homes' },
          ].map(s => (
            <div key={s.label} className="card-surface p-4 text-center">
              <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
              <div className="font-price text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.context}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
