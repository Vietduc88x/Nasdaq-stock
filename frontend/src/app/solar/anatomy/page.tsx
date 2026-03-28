'use client';

import { useState } from 'react';
import Link from 'next/link';
import ModuleExplodedView from '@/components/solar/ModuleExplodedView';
import SupplyChainFlow from '@/components/solar/SupplyChainFlow';
import CostCalculator from '@/components/solar/CostCalculator';

export default function SolarAnatomyPage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pt-2">
        <Link href="/solar" className="inline-flex items-center gap-1 text-[12px] mb-4 group" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Solar PV Cost Model
        </Link>
        <h1 className="text-[26px] font-semibold tracking-tight">What&apos;s Inside a Solar Panel?</h1>
        <p className="text-[14px] mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Explore the layers, materials, and manufacturing costs of a solar PV module.
          Adjust prices below to see how each input affects the final module cost.
        </p>
      </div>

      {/* Exploded View */}
      <ModuleExplodedView activeLayer={activeLayer} onLayerSelect={setActiveLayer} />

      {/* Supply Chain Flow */}
      <div>
        <h2 className="text-[18px] font-semibold mb-4">Supply Chain: From Sand to Solar Panel</h2>
        <SupplyChainFlow />
      </div>

      {/* Interactive Cost Calculator */}
      <div>
        <h2 className="text-[18px] font-semibold mb-2">Module Cost Calculator</h2>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-tertiary)' }}>
          Drag the sliders to adjust material prices, electricity cost, labour, and margins.
          Watch how each change ripples through the supply chain to affect the final module price.
          Based on IRENA&apos;s Solar PV Supply Chain Cost Tool (2026).
        </p>
        <CostCalculator />
      </div>
    </div>
  );
}
