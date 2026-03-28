'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  color: string;
  thickness: number; // visual thickness in px
  yOffset: number; // px from top
  material: string;
  purpose: string;
  costShare: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'glass',
    name: 'Tempered Glass',
    color: '#87CEEB',
    thickness: 28,
    yOffset: 0,
    material: 'Low-iron tempered glass (3.2mm)',
    purpose: 'Protects cells from weather, hail, and UV. Must transmit >90% of sunlight.',
    costShare: '6.7% of module cost ($0.012/Wp)',
    materials: [
      { name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' },
      { name: 'Soda ash', amount: 'trace', price: '—' },
    ],
    funFact: 'Solar glass is 10x clearer than window glass. The iron content must be below 0.01% to avoid absorbing sunlight.',
  },
  {
    id: 'eva-front',
    name: 'EVA Encapsulant (Front)',
    color: '#F5E6CC',
    thickness: 16,
    yOffset: 38,
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Bonds glass to cells. Provides electrical insulation and cushioning against thermal stress.',
    costShare: '2.2% of module cost ($0.004/Wp)',
    materials: [
      { name: 'EVA resin', amount: '0.6 g/Wp', price: '$1.85/kg' },
      { name: 'UV stabilizers', amount: 'trace', price: '—' },
    ],
    funFact: 'EVA turns yellow over 25 years of UV exposure. Newer modules use POE (polyolefin) which lasts longer.',
  },
  {
    id: 'cells',
    name: 'Solar Cells + Interconnects',
    color: '#1a237e',
    thickness: 24,
    yOffset: 64,
    material: 'Monocrystalline silicon wafers with silver paste contacts',
    purpose: 'Converts sunlight into electricity via the photovoltaic effect. Each cell produces ~0.5V.',
    costShare: '22.2% of module cost ($0.040/Wp) — THE most expensive layer',
    materials: [
      { name: 'Silicon wafer', amount: '2.1 g/Wp', price: '$1.70/kg (metal Si)' },
      { name: 'Silver paste', amount: '11.5 mg/Wp', price: '$853/kg ($27/oz)' },
      { name: 'Copper ribbons', amount: '0.28 g/Wp', price: '$4.08/lb' },
      { name: 'Tin solder', amount: '0.05 g/Wp', price: '$12.85/lb' },
    ],
    funFact: 'Silver is the #1 cost swing material. If silver goes up 10%, the cell cost increases ~$0.001/Wp. The industry is racing to replace silver with copper.',
  },
  {
    id: 'eva-back',
    name: 'EVA Encapsulant (Back)',
    color: '#F5E6CC',
    thickness: 16,
    yOffset: 98,
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Seals cells from moisture ingress from the back side. Same material as front EVA.',
    costShare: '2.2% of module cost ($0.004/Wp)',
    materials: [
      { name: 'EVA resin', amount: '0.6 g/Wp', price: '$1.85/kg' },
    ],
    funFact: 'The front and back EVA layers are laminated at 150°C for 15 minutes in a vacuum press.',
  },
  {
    id: 'backsheet',
    name: 'Backsheet',
    color: '#E0E0E0',
    thickness: 14,
    yOffset: 124,
    material: 'Multi-layer polymer film (TPT or TPE)',
    purpose: 'Electrical insulation and moisture barrier. The white surface also reflects unused light back through the cells.',
    costShare: '~2% of module cost',
    materials: [
      { name: 'PVF/PET/PVF layers', amount: '~0.8 g/Wp', price: '~$3/m²' },
    ],
    funFact: 'Bifacial modules replace the backsheet with a second glass layer, gaining 5-15% more energy from reflected light.',
  },
  {
    id: 'frame',
    name: 'Aluminum Frame',
    color: '#A8A9AD',
    thickness: 20,
    yOffset: 148,
    material: 'Anodized aluminum extrusion (35mm depth)',
    purpose: 'Structural support, mounting interface, and edge sealing. Must withstand 5400 Pa snow/wind loads.',
    costShare: '5.3% of module cost ($0.0095/Wp)',
    materials: [
      { name: 'Aluminum alloy 6063', amount: '1.5 g/Wp', price: '$1.15/lb' },
    ],
    funFact: 'Some manufacturers are going frameless to save cost and reduce shipping weight. Each frame uses ~1.8 kg of aluminum per module.',
  },
  {
    id: 'junction-box',
    name: 'Junction Box + Cables',
    color: '#424242',
    thickness: 18,
    yOffset: 178,
    material: 'PPO plastic housing with bypass diodes and MC4 connectors',
    purpose: 'Collects electricity from cell strings, protects against reverse current with bypass diodes, and connects to the system via standard cables.',
    costShare: '~3% of module cost',
    materials: [
      { name: 'Copper conductors', amount: '~0.1 g/Wp', price: '$4.08/lb' },
      { name: 'Bypass diodes (x3)', amount: '3 per module', price: '$0.15 each' },
      { name: 'PPO plastic', amount: '~50g per box', price: '—' },
    ],
    funFact: 'The junction box is the most common failure point in solar modules. High-quality boxes are rated IP68 (fully submersible).',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selectedLayer = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* 3D Exploded View */}
      <div className="card-surface p-6" style={{ minHeight: '500px' }}>
        <div className="section-label mb-4">Module Cross-Section (Exploded View)</div>

        <div className="relative mx-auto" style={{ width: '320px', height: '420px', perspective: '800px' }}>
          {LAYERS.map((layer, i) => {
            const isActive = activeLayer === layer.id;
            const isOtherActive = activeLayer !== null && !isActive;
            const explodeOffset = i * 8; // Separation between layers

            return (
              <div
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="absolute cursor-pointer transition-all duration-500"
                style={{
                  left: '20px',
                  right: '20px',
                  top: `${layer.yOffset + explodeOffset}px`,
                  height: `${layer.thickness}px`,
                  background: layer.color,
                  opacity: isOtherActive ? 0.3 : 1,
                  transform: `
                    rotateX(-15deg) rotateY(15deg) rotateZ(-2deg)
                    ${isActive ? 'translateZ(30px) translateX(-10px) scale(1.05)' : 'translateZ(0)'}
                  `,
                  transformStyle: 'preserve-3d',
                  boxShadow: isActive
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${layer.color}88, inset 0 1px 0 rgba(255,255,255,0.3)`
                    : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  borderRadius: layer.id === 'frame' ? '4px' : '2px',
                  border: `1px solid ${layer.color}66`,
                  zIndex: isActive ? 10 : LAYERS.length - i,
                }}
              >
                {/* Layer label */}
                <div
                  className="absolute right-full mr-3 whitespace-nowrap text-[11px] font-medium flex items-center gap-1.5"
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
                  {layer.name}
                </div>

                {/* 3D side face */}
                <div
                  className="absolute"
                  style={{
                    right: '-8px',
                    top: '0',
                    width: '8px',
                    height: '100%',
                    background: `linear-gradient(90deg, ${layer.color}88, ${layer.color}44)`,
                    transform: 'skewY(-45deg)',
                    transformOrigin: 'top left',
                  }}
                />
                {/* 3D bottom face */}
                <div
                  className="absolute"
                  style={{
                    left: '0',
                    bottom: '-6px',
                    width: '100%',
                    height: '6px',
                    background: `linear-gradient(180deg, ${layer.color}66, ${layer.color}22)`,
                    transform: 'skewX(-45deg)',
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            );
          })}

          {/* Cell grid pattern on the cell layer */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '20px',
              right: '20px',
              top: `${LAYERS[2].yOffset + 2 * 8}px`,
              height: `${LAYERS[2].thickness}px`,
              transform: 'rotateX(-15deg) rotateY(15deg) rotateZ(-2deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Grid lines to simulate cell pattern */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`v${i}`} className="absolute top-0 bottom-0" style={{ left: `${i * 16.66}%`, width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            ))}
            {[1, 2].map(i => (
              <div key={`h${i}`} className="absolute left-0 right-0" style={{ top: `${i * 33.33}%`, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selectedLayer ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded" style={{ background: selectedLayer.color }} />
                <h3 className="text-[18px] font-semibold">{selectedLayer.name}</h3>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{selectedLayer.material}</p>
            </div>

            <div>
              <div className="section-label mb-2">Purpose</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedLayer.purpose}</p>
            </div>

            <div>
              <div className="section-label mb-2">Cost Contribution</div>
              <div className="text-[14px] font-semibold" style={{ color: 'var(--up)' }}>{selectedLayer.costShare}</div>
            </div>

            <div>
              <div className="section-label mb-2">Raw Materials</div>
              <div className="space-y-2">
                {selectedLayer.materials.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <div className="text-[13px] font-medium">{m.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{m.amount}</div>
                    </div>
                    <div className="font-price text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{m.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--accent-gold)' }}>Did you know?</div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{selectedLayer.funFact}</p>
            </div>
          </div>
        ) : (
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
            <div className="text-[40px] mb-4">👆</div>
            <div className="text-[16px] font-semibold mb-2">Click a layer to explore</div>
            <p className="text-[13px] max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Each layer of a solar panel has different materials, costs, and supply chain dynamics.
              Click any layer in the exploded view to see the details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
