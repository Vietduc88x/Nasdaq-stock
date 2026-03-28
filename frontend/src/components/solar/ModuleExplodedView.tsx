'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  color: string;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'glass', name: 'Tempered Glass', color: '#87CEEB',
    material: 'Low-iron tempered glass (3.2mm)',
    purpose: 'Protects cells from weather, hail, and UV. Transmits >90% of sunlight.',
    costShare: '6.7%', costValue: '$0.012/Wp',
    materials: [
      { name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' },
    ],
    funFact: 'Solar glass is 10× clearer than window glass — iron content must be below 0.01%.',
  },
  {
    id: 'eva-front', name: 'EVA Encapsulant', color: '#F5DEB3',
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Bonds glass to cells. Electrical insulation and cushioning.',
    costShare: '4.4%', costValue: '$0.008/Wp',
    materials: [
      { name: 'EVA resin', amount: '1.2 g/Wp', price: '$1.85/kg' },
    ],
    funFact: 'Laminated at 150°C for 15 minutes in a vacuum press.',
  },
  {
    id: 'cells', name: 'Solar Cells', color: '#1565C0',
    material: 'Monocrystalline silicon + silver paste + copper ribbons',
    purpose: 'Converts sunlight to electricity. Each cell: ~0.5V, ~10W. A 72-cell module: ~700W.',
    costShare: '22.2%', costValue: '$0.040/Wp',
    materials: [
      { name: 'Silicon wafer', amount: '2.1 g/Wp', price: '$1.70/kg' },
      { name: 'Silver paste', amount: '11.5 mg/Wp', price: '$853/kg' },
      { name: 'Copper ribbon', amount: '0.28 g/Wp', price: '$4.08/lb' },
      { name: 'Tin solder', amount: '0.05 g/Wp', price: '$12.85/lb' },
    ],
    funFact: 'Silver is the #1 cost swing material. Industry is racing to replace it with copper plating.',
  },
  {
    id: 'backsheet', name: 'Backsheet', color: '#E0E0E0',
    material: 'Multi-layer polymer film (TPT)',
    purpose: 'Moisture barrier and electrical insulation. White surface reflects unused light.',
    costShare: '~2%', costValue: '$0.004/Wp',
    materials: [
      { name: 'PVF/PET/PVF', amount: '~0.8 g/Wp', price: '~$3/m²' },
    ],
    funFact: 'Bifacial modules replace this with glass, gaining 5-15% more energy from reflected light.',
  },
  {
    id: 'frame', name: 'Aluminum Frame', color: '#9E9E9E',
    material: 'Anodized aluminum 6063 (35mm depth)',
    purpose: 'Structural support. Must withstand 5,400 Pa snow/wind loads.',
    costShare: '5.3%', costValue: '$0.0095/Wp',
    materials: [
      { name: 'Aluminum 6063', amount: '1.5 g/Wp (~1.8 kg/module)', price: '$1.15/lb' },
    ],
    funFact: 'Each frame uses ~1.8 kg of aluminum — about 3 soda cans worth.',
  },
  {
    id: 'jbox', name: 'Junction Box', color: '#424242',
    material: 'PPO housing + bypass diodes + MC4 connectors',
    purpose: 'Collects electricity. Bypass diodes prevent hot spots when cells are shaded.',
    costShare: '~3%', costValue: '$0.005/Wp',
    materials: [
      { name: 'Copper conductors', amount: '~0.1 g/Wp', price: '$4.08/lb' },
      { name: 'Bypass diodes (×3)', amount: '3 per module', price: '$0.15 each' },
    ],
    funFact: 'The junction box is the most common failure point. High-quality boxes are rated IP68.',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
      {/* Panel View */}
      <div className="card-surface p-6">
        <div className="section-label mb-5">Solar PV Module — Interactive View</div>

        {/* 3D-ish panel rendering */}
        <div className="relative mx-auto" style={{ maxWidth: '440px' }}>
          {/* Panel top face — the actual solar panel */}
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              aspectRatio: '2 / 1.2',
              background: activeLayer === 'cells' ? '#1565C0' : '#1a237e',
              border: `3px solid ${activeLayer === 'frame' ? '#fff' : '#666'}`,
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
              transform: 'perspective(800px) rotateX(8deg) rotateY(-3deg)',
            }}
          >
            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: activeLayer === 'glass'
                  ? 'linear-gradient(135deg, rgba(135,206,235,0.4) 0%, transparent 50%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)',
                borderRadius: '5px',
              }}
            />

            {/* Cell grid */}
            <div className="absolute inset-[6px] grid grid-cols-12 grid-rows-6 gap-[2px]">
              {Array.from({ length: 72 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[1px] transition-all duration-300"
                  style={{
                    background: activeLayer === 'cells'
                      ? 'linear-gradient(180deg, #1976D2 0%, #0D47A1 100%)'
                      : 'linear-gradient(180deg, #1a237e 0%, #0d1642 100%)',
                    border: '0.5px solid rgba(255,255,255,0.05)',
                    opacity: activeLayer && activeLayer !== 'cells' && activeLayer !== 'glass' ? 0.4 : 1,
                  }}
                />
              ))}
            </div>

            {/* Silver busbars (vertical lines) */}
            <div className="absolute inset-[6px] pointer-events-none flex justify-around">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="h-full transition-all duration-300"
                  style={{
                    width: '1px',
                    background: activeLayer === 'cells' ? 'rgba(192,192,192,0.6)' : 'rgba(192,192,192,0.15)',
                  }}
                />
              ))}
            </div>

            {/* Junction box (back center) */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded transition-all duration-300 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onLayerSelect(activeLayer === 'jbox' ? null : 'jbox'); }}
              style={{
                width: '40px',
                height: '20px',
                background: activeLayer === 'jbox' ? '#616161' : '#333',
                border: `1px solid ${activeLayer === 'jbox' ? '#fff' : '#555'}`,
                boxShadow: activeLayer === 'jbox' ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
              }}
            >
              {/* MC4 cables */}
              <div className="absolute -bottom-3 left-1/3 w-[1px] h-3" style={{ background: '#555' }} />
              <div className="absolute -bottom-3 right-1/3 w-[1px] h-3" style={{ background: '#555' }} />
            </div>
          </div>

          {/* Cross-section cutaway — bottom right corner */}
          <div
            className="absolute -bottom-4 -right-4 rounded-lg overflow-hidden"
            style={{
              width: '160px',
              border: '2px solid rgba(255,255,255,0.15)',
              background: '#0a0a0a',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            }}
          >
            <div className="text-[8px] font-semibold uppercase tracking-wider px-2 pt-1.5 pb-1" style={{ color: 'var(--text-faint)' }}>
              Cross-section
            </div>
            {LAYERS.filter(l => l.id !== 'jbox').map(layer => {
              const isActive = activeLayer === layer.id;
              const heights: Record<string, number> = { glass: 14, 'eva-front': 6, cells: 10, backsheet: 6, frame: 8 };
              const h = heights[layer.id] || 8;
              return (
                <div
                  key={layer.id}
                  onClick={(e) => { e.stopPropagation(); onLayerSelect(isActive ? null : layer.id); }}
                  className="cursor-pointer transition-all duration-200 flex items-center"
                  style={{
                    height: `${h}px`,
                    background: layer.color,
                    opacity: activeLayer && !isActive ? 0.35 : 1,
                    borderBottom: '0.5px solid rgba(0,0,0,0.3)',
                    outline: isActive ? '1.5px solid #fff' : 'none',
                    outlineOffset: '-1px',
                  }}
                />
              );
            })}
            {/* Labels */}
            <div className="px-2 py-1.5 space-y-0">
              {LAYERS.filter(l => l.id !== 'jbox').map(l => (
                <div
                  key={l.id}
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => onLayerSelect(activeLayer === l.id ? null : l.id)}
                >
                  <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-[7px] leading-tight" style={{ color: activeLayer === l.id ? '#fff' : 'var(--text-faint)' }}>
                    {l.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Layer click targets overlaid on the panel */}
          <div className="absolute inset-0" style={{ transform: 'perspective(800px) rotateX(8deg) rotateY(-3deg)' }}>
            {/* Glass = entire front surface */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => onLayerSelect(activeLayer === 'glass' ? null : 'glass')} />
            {/* Cells = inner area */}
            <div className="absolute inset-[6px] cursor-pointer" onClick={() => onLayerSelect(activeLayer === 'cells' ? null : 'cells')} />
            {/* Frame = border area */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const border = 12;
                if (x < border || x > rect.width - border || y < border || y > rect.height - border) {
                  onLayerSelect(activeLayer === 'frame' ? null : 'frame');
                }
              }}
            />
          </div>
        </div>

        {/* Layer selector buttons below */}
        <div className="flex flex-wrap gap-2 mt-10 justify-center">
          {LAYERS.map(l => (
            <button
              key={l.id}
              onClick={() => onLayerSelect(activeLayer === l.id ? null : l.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: activeLayer === l.id ? `${l.color}25` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeLayer === l.id ? `${l.color}55` : 'var(--border-subtle)'}`,
                color: activeLayer === l.id ? '#fff' : 'var(--text-muted)',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded" style={{ background: selected.color }} />
              <h3 className="text-[18px] font-semibold">{selected.name}</h3>
            </div>
            <div className="flex gap-3">
              <span className="font-price text-[16px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
              <span className="text-[12px] self-center" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of total module cost</span>
            </div>

            <div>
              <div className="section-label mb-1.5">What it is</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.material}</p>
            </div>

            <div>
              <div className="section-label mb-1.5">Why it matters</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.purpose}</p>
            </div>

            <div>
              <div className="section-label mb-2">Raw Materials</div>
              <div className="space-y-1.5">
                {selected.materials.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.025)' }}>
                    <div>
                      <div className="text-[13px] font-medium">{m.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{m.amount}</div>
                    </div>
                    <div className="font-price text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{m.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'rgba(196,164,124,0.06)', borderLeft: '3px solid var(--accent-gold)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-gold)' }}>Did you know?</div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{selected.funFact}</p>
            </div>
          </div>
        ) : (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '460px' }}>
            <div className="text-[48px] mb-4 opacity-60">☀️</div>
            <div className="text-[17px] font-semibold mb-2">Click a layer to explore</div>
            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              A solar module has 6 distinct layers. Click on the panel, the cross-section cutaway, or the buttons below to see what each layer is made of.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
