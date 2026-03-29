'use client';

import { useState } from 'react';
import Link from 'next/link';
import BatteryExplodedView from '@/components/bess/BatteryExplodedView';
import BessSupplyChainFlow from '@/components/bess/BessSupplyChainFlow';

export default function BessAnatomyPage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pt-2">
        <Link href="/bess" className="inline-flex items-center gap-1 text-[12px] mb-4 group" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BESS Cost Model
        </Link>
        <h1 className="text-[26px] font-semibold tracking-tight">What&apos;s Inside a Battery Pack?</h1>
        <p className="text-[14px] mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Explore the components, materials, and manufacturing costs of a lithium-ion battery energy storage system.
          From cathode chemistry to pack-level thermal management — every layer that determines $/kWh.
        </p>
      </div>

      {/* Exploded View */}
      <BatteryExplodedView activeLayer={activeLayer} onLayerSelect={setActiveLayer} />

      {/* Supply Chain Flow */}
      <div>
        <h2 className="text-[18px] font-semibold mb-4">Supply Chain: From Mine to Megapack</h2>
        <BessSupplyChainFlow />
      </div>

      {/* Chemistry Comparison */}
      <div>
        <h2 className="text-[18px] font-semibold mb-4">LFP vs NMC811: Which Chemistry?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[20px]">🟢</span>
              <h3 className="text-[15px] font-semibold">LFP (Lithium Iron Phosphate)</h3>
            </div>
            <div className="space-y-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between"><span>Pack cost</span><span className="font-price font-medium">~$64/kWh</span></div>
              <div className="flex justify-between"><span>Energy density</span><span>160 Wh/kg (cell)</span></div>
              <div className="flex justify-between"><span>Cycle life</span><span style={{ color: 'var(--up)' }}>4,000-6,000 cycles</span></div>
              <div className="flex justify-between"><span>Thermal runaway</span><span style={{ color: 'var(--up)' }}>270°C (very safe)</span></div>
              <div className="flex justify-between"><span>Critical minerals</span><span style={{ color: 'var(--up)' }}>No Co, No Ni</span></div>
            </div>
            <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
              Dominant for utility-scale BESS. Lower cost, longer life, safer. Preferred by Tesla Megapack, BYD, CATL.
            </p>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[20px]">🔵</span>
              <h3 className="text-[15px] font-semibold">NMC811 (Nickel Manganese Cobalt)</h3>
            </div>
            <div className="space-y-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between"><span>Pack cost</span><span className="font-price font-medium">~$92/kWh</span></div>
              <div className="flex justify-between"><span>Energy density</span><span style={{ color: 'var(--up)' }}>250 Wh/kg (cell)</span></div>
              <div className="flex justify-between"><span>Cycle life</span><span>1,500-3,000 cycles</span></div>
              <div className="flex justify-between"><span>Thermal runaway</span><span style={{ color: 'var(--down)' }}>210°C (less safe)</span></div>
              <div className="flex justify-between"><span>Critical minerals</span><span style={{ color: 'var(--down)' }}>Ni 75%, Co 9%</span></div>
            </div>
            <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
              Used where space/weight matters (EVs, behind-the-meter). Higher energy density but shorter life and supply chain risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
