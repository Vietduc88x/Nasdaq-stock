'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  height: string;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'glass', name: 'Tempered Glass', color: 'linear-gradient(135deg, #b8dce8 0%, #8cc5d9 50%, #6bafc5 100%)', borderColor: '#7dbfd4',
    height: '3.2mm',
    material: 'Low-iron tempered glass (3.2mm thick)',
    purpose: 'Protects cells from weather, hail, and UV. Transmits >90% of sunlight while surviving 25+ years outdoors.',
    costShare: '6.7%', costValue: '$0.012/Wp',
    materials: [{ name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' }],
    funFact: 'Solar glass is 10× clearer than window glass — iron content must be below 0.01%.',
  },
  {
    id: 'eva-front', name: 'EVA Encapsulant', color: 'linear-gradient(135deg, #f5eed8 0%, #e8dfc2 50%, #ddd4b5 100%)', borderColor: '#d4c9a8',
    height: '0.45mm',
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Bonds glass to cells. Electrical insulation and cushioning against thermal stress.',
    costShare: '4.4%', costValue: '$0.008/Wp',
    materials: [{ name: 'EVA resin', amount: '1.2 g/Wp (both layers)', price: '$1.85/kg' }],
    funFact: 'Laminated at 150°C for 15 minutes in a vacuum press.',
  },
  {
    id: 'cells', name: 'Solar Cells', color: 'linear-gradient(135deg, #2a3050 0%, #1a2040 50%, #101830 100%)', borderColor: '#3a4060',
    height: '0.15mm',
    material: 'Monocrystalline silicon wafers + silver paste + copper ribbons',
    purpose: 'Converts sunlight to electricity. Each cell: ~0.5V, ~10W. A 72-cell module: ~700Wp.',
    costShare: '22.2%', costValue: '$0.040/Wp',
    materials: [
      { name: 'Silicon wafer', amount: '2.1 g/Wp', price: '$1.70/kg' },
      { name: 'Silver paste', amount: '11.5 mg/Wp', price: '$853/kg' },
      { name: 'Copper ribbon', amount: '0.28 g/Wp', price: '$4.08/lb' },
      { name: 'Tin solder', amount: '0.05 g/Wp', price: '$12.85/lb' },
    ],
    funFact: 'Silver is the #1 cost swing material. The industry is racing to replace it with copper plating.',
  },
  {
    id: 'eva-back', name: 'EVA Encapsulant', color: 'linear-gradient(135deg, #f5eed8 0%, #e8dfc2 50%, #ddd4b5 100%)', borderColor: '#d4c9a8',
    height: '0.45mm',
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Seals cells from moisture on the back side.',
    costShare: '(incl. above)', costValue: '—',
    materials: [{ name: 'EVA resin', amount: '(included above)', price: '—' }],
    funFact: 'Front and back EVA are identical — they melt and fuse around cells during lamination.',
  },
  {
    id: 'backsheet', name: 'Backsheet', color: 'linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 50%, #c5c5c5 100%)', borderColor: '#bbb',
    height: '0.3mm',
    material: 'Multi-layer polymer (Tedlar/PET/Tedlar)',
    purpose: 'Moisture barrier and electrical insulation. White surface reflects light.',
    costShare: '~2%', costValue: '$0.004/Wp',
    materials: [{ name: 'PVF/PET/PVF', amount: '~0.8 g/Wp', price: '~$3/m²' }],
    funFact: 'Bifacial modules replace this with glass, gaining 5–15% more energy.',
  },
  {
    id: 'frame', name: 'Aluminum Frame', color: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 50%, #909090 100%)', borderColor: '#888',
    height: '35mm',
    material: 'Anodized aluminum 6063 alloy',
    purpose: 'Structural support. Must withstand 5,400 Pa snow/wind loads.',
    costShare: '5.3%', costValue: '$0.0095/Wp',
    materials: [{ name: 'Aluminum 6063', amount: '1.5 g/Wp (~1.8 kg)', price: '$1.15/lb' }],
    funFact: 'Each frame uses ~1.8 kg of aluminum — about the weight of 3 soda cans.',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
      {/* Exploded Stack */}
      <div className="card-surface p-6 flex flex-col">
        <div className="section-label mb-4">Solar PV Module — Exploded View</div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ perspective: '1000px' }}>
          {LAYERS.map((layer, i) => {
            const isActive = activeLayer === layer.id;
            const isOther = activeLayer !== null && !isActive;

            return (
              <div
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="relative cursor-pointer transition-all duration-300"
                style={{
                  width: layer.id === 'frame' ? '92%' : '85%',
                  maxWidth: layer.id === 'frame' ? '380px' : '350px',
                  height: layer.id === 'cells' ? '52px' : layer.id === 'glass' ? '36px' : layer.id === 'frame' ? '28px' : '18px',
                  background: layer.color,
                  borderRadius: layer.id === 'frame' ? '4px' : '3px',
                  border: isActive ? '2px solid #fff' : `1px solid ${layer.borderColor}40`,
                  opacity: isOther ? 0.35 : 1,
                  transform: `rotateX(45deg) rotateZ(-2deg) ${isActive ? 'scale(1.04) translateY(-4px)' : ''}`,
                  transformStyle: 'preserve-3d',
                  boxShadow: isActive
                    ? `0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2), 0 -4px 12px rgba(255,255,255,0.05) inset`
                    : `0 4px 12px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.1) inset`,
                }}
              >
                {/* Cell grid on solar cells layer */}
                {layer.id === 'cells' && (
                  <div className="absolute inset-1 grid grid-cols-12 grid-rows-4 gap-[1px] pointer-events-none">
                    {Array.from({ length: 48 }).map((_, j) => (
                      <div key={j} className="bg-[#0a1025] border border-[#2a3555]/30 rounded-[0.5px]" />
                    ))}
                  </div>
                )}

                {/* Glass reflection */}
                {layer.id === 'glass' && (
                  <div className="absolute inset-0 rounded-[3px] pointer-events-none" style={{
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.25) 0%, transparent 35%)',
                  }} />
                )}

                {/* Layer name + cost overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <span className="text-[11px] font-semibold drop-shadow-md" style={{
                    color: ['cells', 'frame'].includes(layer.id) ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
                  }}>
                    {layer.name}
                  </span>
                  {layer.costValue !== '—' && (
                    <span className="text-[10px] font-mono font-semibold drop-shadow-md" style={{
                      color: ['cells', 'frame'].includes(layer.id) ? 'rgba(52,199,89,0.9)' : 'rgba(20,80,50,0.7)',
                    }}>
                      {layer.costValue}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Thickness legend */}
        <div className="flex justify-center gap-4 mt-4 text-[10px]" style={{ color: 'var(--text-faint)' }}>
          <span>Total thickness: ~40mm</span>
          <span>|</span>
          <span>Total cost: $0.180/Wp</span>
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-5 rounded" style={{ background: selected.color, border: `1px solid ${selected.borderColor}` }} />
                <h3 className="text-[18px] font-semibold">{selected.name}</h3>
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>Thickness: {selected.height}</div>
            </div>

            {selected.costValue !== '—' && (
              <div className="flex gap-3 items-baseline">
                <span className="font-price text-[20px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of module</span>
              </div>
            )}

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
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '480px' }}>
            <div className="text-[48px] mb-4 opacity-60">☀️</div>
            <div className="text-[17px] font-semibold mb-2">Click a layer to explore</div>
            <p className="text-[13px] max-w-xs leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              A solar module has 6 distinct layers — each with different materials, costs, and supply chain dynamics.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {LAYERS.map(l => (
                <button
                  key={l.id}
                  onClick={() => onLayerSelect(l.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: l.color, border: `1px solid ${l.borderColor}` }} />
                  <span>
                    <span style={{ color: 'var(--text-secondary)' }}>{l.name}</span>
                    {l.costValue !== '—' && <span className="block text-[9px] font-mono" style={{ color: 'var(--text-faint)' }}>{l.costValue}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
