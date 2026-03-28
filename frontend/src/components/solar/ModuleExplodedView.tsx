'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Layer {
  id: string;
  name: string;
  // Clickable hotspot area as % of image (top, height)
  hotspotTop: number;
  hotspotHeight: number;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  thickness: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'frame', name: 'Aluminum Frame',
    hotspotTop: 0, hotspotHeight: 18,
    thickness: '35mm depth',
    material: 'Anodized aluminum 6063 alloy extrusion',
    purpose: 'Structural support and mounting interface. Must withstand 5,400 Pa snow/wind loads. Protects glass edges.',
    costShare: '5.3%', costValue: '$0.0095/Wp',
    materials: [{ name: 'Aluminum 6063', amount: '1.5 g/Wp (~1.8 kg/module)', price: '$1.15/lb' }],
    funFact: 'Each frame uses ~1.8 kg of aluminum — about 3 soda cans worth. Some manufacturers go frameless to cut cost.',
  },
  {
    id: 'glass', name: 'Tempered Glass',
    hotspotTop: 18, hotspotHeight: 14,
    thickness: '3.2mm',
    material: 'Low-iron tempered glass with anti-reflective coating',
    purpose: 'Protects cells from weather, hail, and UV. Must transmit >90% of sunlight while surviving 25+ years outdoors.',
    costShare: '6.7%', costValue: '$0.012/Wp',
    materials: [{ name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' }],
    funFact: 'Solar glass is 10× clearer than window glass — iron content must be below 0.01% to avoid absorbing sunlight.',
  },
  {
    id: 'eva-front', name: 'Encapsulant — EVA (Front)',
    hotspotTop: 32, hotspotHeight: 12,
    thickness: '0.45mm',
    material: 'Ethylene-vinyl acetate (EVA) film',
    purpose: 'Bonds glass to cells. Provides electrical insulation and cushioning against thermal expansion stress.',
    costShare: '4.4%', costValue: '$0.008/Wp',
    materials: [{ name: 'EVA resin', amount: '1.2 g/Wp (both layers)', price: '$1.85/kg' }],
    funFact: 'EVA yellows over 25 years of UV. Newer modules use POE (polyolefin elastomer) which stays transparent longer.',
  },
  {
    id: 'cells', name: 'Solar Cells',
    hotspotTop: 44, hotspotHeight: 16,
    thickness: '0.15mm (150μm)',
    material: 'Monocrystalline silicon wafers with silver paste contacts and copper interconnect ribbons',
    purpose: 'Converts sunlight into electricity via the photovoltaic effect. Each cell produces ~0.5V and ~10W. A standard 72-cell module outputs ~700Wp.',
    costShare: '22.2%', costValue: '$0.040/Wp',
    materials: [
      { name: 'Silicon wafer', amount: '2.1 g/Wp', price: '$1.70/kg (metal Si)' },
      { name: 'Silver paste (contacts)', amount: '11.5 mg/Wp', price: '$853/kg ($27/oz)' },
      { name: 'Copper ribbon (interconnects)', amount: '0.28 g/Wp', price: '$4.08/lb' },
      { name: 'Tin solder', amount: '0.05 g/Wp', price: '$12.85/lb' },
    ],
    funFact: 'Silver is the #1 cost swing material — if silver rises 10%, cell cost increases ~$0.001/Wp. The industry is racing to replace silver with copper plating.',
  },
  {
    id: 'eva-back', name: 'Encapsulant — EVA (Back)',
    hotspotTop: 60, hotspotHeight: 10,
    thickness: '0.45mm',
    material: 'Ethylene-vinyl acetate (EVA) film — identical to front layer',
    purpose: 'Seals cells from moisture ingress on the back side. Laminated simultaneously with front EVA at 150°C.',
    costShare: '(incl. above)', costValue: '—',
    materials: [{ name: 'EVA resin', amount: '(included in front EVA total)', price: '—' }],
    funFact: 'The front and back EVA sheets are identical — they melt and fuse around the cells during vacuum lamination.',
  },
  {
    id: 'backsheet', name: 'Back Sheet',
    hotspotTop: 70, hotspotHeight: 12,
    thickness: '0.3mm',
    material: 'Multi-layer polymer film (Tedlar/PET/Tedlar or TPE)',
    purpose: 'Electrical insulation and moisture barrier. The white surface reflects unused light back through the cells for extra energy.',
    costShare: '~2%', costValue: '$0.004/Wp',
    materials: [{ name: 'PVF/PET/PVF layers', amount: '~0.8 g/Wp', price: '~$3/m²' }],
    funFact: 'Bifacial modules replace the backsheet with a second glass layer, gaining 5–15% more energy from ground-reflected light.',
  },
  {
    id: 'jbox', name: 'Junction Box',
    hotspotTop: 82, hotspotHeight: 18,
    thickness: '60×40×20mm',
    material: 'PPO plastic housing with bypass diodes and MC4 connectors',
    purpose: 'Collects electricity from cell strings, protects against reverse current with bypass diodes, connects to system via MC4 cables.',
    costShare: '~3%', costValue: '$0.005/Wp',
    materials: [
      { name: 'Copper conductors', amount: '~0.1 g/Wp', price: '$4.08/lb' },
      { name: 'Bypass diodes (×3)', amount: '3 per module', price: '$0.15 each' },
    ],
    funFact: 'The junction box is the most common failure point in solar modules. High-quality boxes are rated IP68 (fully submersible).',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
      {/* Image with hotspots */}
      <div className="card-surface p-5">
        <div className="section-label mb-4">Solar PV Module — Exploded View</div>

        <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
          {/* The actual image */}
          <Image
            src="/images/solar-assembly.jpg"
            alt="Solar PV module exploded view showing layers: aluminum frame, tempered glass, EVA encapsulant, solar cells, backsheet, junction box"
            width={900}
            height={750}
            className="w-full h-auto rounded-lg"
            priority
          />

          {/* Interactive hotspot overlays */}
          {LAYERS.map(layer => {
            const isActive = activeLayer === layer.id;
            return (
              <div
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="absolute left-0 right-0 cursor-pointer transition-all duration-300"
                style={{
                  top: `${layer.hotspotTop}%`,
                  height: `${layer.hotspotHeight}%`,
                  background: isActive ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                  border: isActive ? '2px solid rgba(52, 199, 89, 0.5)' : '2px solid transparent',
                  borderRadius: '4px',
                }}
              >
                {/* Hover highlight */}
                <div className="absolute inset-0 rounded opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            );
          })}
        </div>

        {/* Attribution */}
        <div className="text-[9px] mt-3 text-center" style={{ color: 'var(--text-faint)' }}>
          Image: Clean Energy Reviews (cleanenergyreviews.info) — CC licensed
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            <div>
              <h3 className="text-[18px] font-semibold">{selected.name}</h3>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Thickness: {selected.thickness}</div>
            </div>

            {selected.costValue !== '—' && (
              <div className="flex gap-3 items-baseline">
                <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of module cost</span>
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
              Click any layer on the exploded view image to see its material composition, cost contribution, and supply chain details.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {LAYERS.map(l => (
                <button
                  key={l.id}
                  onClick={() => onLayerSelect(l.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-medium text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
