'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  color: string;
  height: number;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'glass', name: 'Tempered Glass', color: '#87CEEB', height: 48,
    material: 'Low-iron tempered glass (3.2mm)',
    purpose: 'Protects cells from weather, hail, and UV. Must transmit >90% of sunlight while surviving 25+ years outdoors.',
    costShare: '6.7%', costValue: '$0.012/Wp',
    materials: [
      { name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' },
      { name: 'Soda ash + limestone', amount: 'trace', price: '—' },
    ],
    funFact: 'Solar glass is 10× clearer than window glass — iron content must be below 0.01% to avoid absorbing sunlight.',
  },
  {
    id: 'eva-front', name: 'EVA Encapsulant', color: '#F5DEB3', height: 24,
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Bonds glass to cells. Provides electrical insulation and cushioning against thermal expansion stress.',
    costShare: '4.4%', costValue: '$0.008/Wp',
    materials: [
      { name: 'EVA resin', amount: '1.2 g/Wp (both layers)', price: '$1.85/kg' },
      { name: 'UV stabilizers + peroxides', amount: 'trace', price: '—' },
    ],
    funFact: 'EVA yellows over 25 years of UV. Newer modules use POE (polyolefin elastomer) which stays transparent longer.',
  },
  {
    id: 'cells', name: 'Solar Cells', color: '#1565C0', height: 40,
    material: 'Monocrystalline silicon wafers + silver paste contacts + copper ribbons',
    purpose: 'Converts sunlight into electricity via the photovoltaic effect. Each cell produces ~0.5V and ~10W. A 72-cell module produces ~700W.',
    costShare: '22.2%', costValue: '$0.040/Wp',
    materials: [
      { name: 'Silicon wafer', amount: '2.1 g/Wp', price: '$1.70/kg (metal Si)' },
      { name: 'Silver paste (contacts)', amount: '11.5 mg/Wp', price: '$853/kg' },
      { name: 'Copper ribbon (interconnects)', amount: '0.28 g/Wp', price: '$4.08/lb' },
      { name: 'Tin solder', amount: '0.05 g/Wp', price: '$12.85/lb' },
      { name: 'Anti-reflective coating (SiNx)', amount: 'nm-scale', price: '—' },
    ],
    funFact: 'Silver is the #1 cost swing material — if silver rises 10%, cell cost rises ~$0.001/Wp. The industry is racing to replace silver with copper plating.',
  },
  {
    id: 'backsheet', name: 'Backsheet', color: '#E0E0E0', height: 22,
    material: 'Multi-layer polymer film (TPT or glass-glass for bifacial)',
    purpose: 'Electrical insulation and moisture barrier. White surface reflects unused light. Must last 25+ years without cracking.',
    costShare: '~2%', costValue: '~$0.004/Wp',
    materials: [
      { name: 'PVF/PET/PVF layers', amount: '~0.8 g/Wp', price: '~$3/m²' },
    ],
    funFact: 'Bifacial modules replace the backsheet with a second glass layer, gaining 5–15% more energy from ground-reflected light.',
  },
  {
    id: 'frame', name: 'Aluminum Frame', color: '#9E9E9E', height: 36,
    material: 'Anodized aluminum extrusion (6063 alloy, 35mm depth)',
    purpose: 'Structural support and mounting interface. Must withstand 5,400 Pa snow/wind loads. Protects glass edges from chipping.',
    costShare: '5.3%', costValue: '$0.0095/Wp',
    materials: [
      { name: 'Aluminum alloy 6063', amount: '1.5 g/Wp (~1.8 kg/module)', price: '$1.15/lb' },
    ],
    funFact: 'Some manufacturers go frameless to save cost and weight. Each frame uses ~1.8 kg of aluminum — about 3 soda cans worth.',
  },
  {
    id: 'jbox', name: 'Junction Box', color: '#616161', height: 28,
    material: 'PPO plastic housing + bypass diodes + MC4 connectors + cables',
    purpose: 'Collects electricity from cell strings. Bypass diodes prevent hot spots when cells are shaded. MC4 connectors allow easy series wiring.',
    costShare: '~3%', costValue: '~$0.005/Wp',
    materials: [
      { name: 'Copper conductors', amount: '~0.1 g/Wp', price: '$4.08/lb' },
      { name: 'Bypass diodes (×3)', amount: '3 per module', price: '$0.15 each' },
      { name: 'PPO plastic housing', amount: '~50g', price: '—' },
    ],
    funFact: 'The junction box is the most common failure point. High-quality boxes are rated IP68 — fully submersible in water.',
  },
];

const TOTAL_HEIGHT = LAYERS.reduce((s, l) => s + l.height, 0) + (LAYERS.length - 1) * 12; // 12px gap

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  let yPos = 0;
  const layerPositions = LAYERS.map(l => {
    const pos = yPos;
    yPos += l.height + 12;
    return pos;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-5">
      {/* SVG Cross-Section */}
      <div className="card-surface p-5">
        <div className="section-label mb-4">Module Cross-Section</div>

        <svg
          viewBox={`0 0 500 ${TOTAL_HEIGHT + 20}`}
          className="w-full"
          style={{ maxHeight: '520px' }}
        >
          {LAYERS.map((layer, i) => {
            const y = layerPositions[i];
            const isActive = activeLayer === layer.id;
            const isOther = activeLayer !== null && !isActive;

            // Main rectangle
            const rectX = 160;
            const rectW = 300;

            return (
              <g
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="cursor-pointer"
                style={{ transition: 'opacity 0.3s' }}
                opacity={isOther ? 0.35 : 1}
              >
                {/* Layer body */}
                <rect
                  x={rectX}
                  y={y}
                  width={rectW}
                  height={layer.height}
                  rx={4}
                  fill={layer.color}
                  stroke={isActive ? '#fff' : `${layer.color}88`}
                  strokeWidth={isActive ? 2 : 1}
                  style={{ filter: isActive ? 'brightness(1.2)' : 'none', transition: 'all 0.3s' }}
                />

                {/* Cell grid pattern */}
                {layer.id === 'cells' && (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(j => (
                      <line key={`v${j}`} x1={rectX + j * (rectW / 12)} y1={y + 2} x2={rectX + j * (rectW / 12)} y2={y + layer.height - 2} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    ))}
                    {[1, 2, 3, 4, 5].map(j => (
                      <line key={`h${j}`} x1={rectX + 2} y1={y + j * (layer.height / 6)} x2={rectX + rectW - 2} y2={y + j * (layer.height / 6)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    ))}
                    {/* Silver busbars */}
                    <line x1={rectX + rectW * 0.33} y1={y} x2={rectX + rectW * 0.33} y2={y + layer.height} stroke="rgba(192,192,192,0.5)" strokeWidth="1.5" />
                    <line x1={rectX + rectW * 0.67} y1={y} x2={rectX + rectW * 0.67} y2={y + layer.height} stroke="rgba(192,192,192,0.5)" strokeWidth="1.5" />
                  </>
                )}

                {/* Glass reflection */}
                {layer.id === 'glass' && (
                  <rect x={rectX + 20} y={y + 6} width={80} height={8} rx={4} fill="rgba(255,255,255,0.2)" />
                )}

                {/* Label + connector line */}
                <line
                  x1={rectX - 8}
                  y1={y + layer.height / 2}
                  x2={rectX - 40}
                  y2={y + layer.height / 2}
                  stroke={isActive ? '#fff' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={1}
                  strokeDasharray={isActive ? 'none' : '2 2'}
                />
                <circle
                  cx={rectX - 40}
                  cy={y + layer.height / 2}
                  r={3}
                  fill={isActive ? layer.color : 'rgba(255,255,255,0.2)'}
                />
                <text
                  x={rectX - 48}
                  y={y + layer.height / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={isActive ? '#fff' : 'rgba(255,255,255,0.5)'}
                  fontSize="11"
                  fontWeight={isActive ? 600 : 400}
                  fontFamily="Inter, sans-serif"
                >
                  {layer.name}
                </text>

                {/* Cost label on right */}
                <text
                  x={rectX + rectW + 12}
                  y={y + layer.height / 2}
                  dominantBaseline="middle"
                  fill={isActive ? 'var(--up, #34C759)' : 'rgba(255,255,255,0.25)'}
                  fontSize="10"
                  fontWeight={500}
                  fontFamily="SF Mono, monospace"
                >
                  {layer.costValue}
                </text>

                {/* Hover overlay */}
                <rect
                  x={rectX}
                  y={y}
                  width={rectW}
                  height={layer.height}
                  rx={4}
                  fill="transparent"
                  className="hover:fill-white/5 transition-all"
                />
              </g>
            );
          })}

          {/* Dimension arrow on the right */}
          <line x1={475} y1={0} x2={475} y2={TOTAL_HEIGHT} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          <text x={480} y={TOTAL_HEIGHT / 2} fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="SF Mono, monospace" dominantBaseline="middle" transform={`rotate(90, 480, ${TOTAL_HEIGHT / 2})`}>
            ~40mm total thickness
          </text>
        </svg>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ background: selected.color }} />
              <h3 className="text-[18px] font-semibold">{selected.name}</h3>
              <span className="font-price text-[14px] font-semibold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>({selected.costShare} of module)</span>
            </div>

            {/* Material */}
            <div>
              <div className="section-label mb-1.5">What it is</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.material}</p>
            </div>

            {/* Purpose */}
            <div>
              <div className="section-label mb-1.5">Why it matters</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.purpose}</p>
            </div>

            {/* Raw Materials Table */}
            <div>
              <div className="section-label mb-2">Raw Materials</div>
              <div className="space-y-1">
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

            {/* Fun fact */}
            <div className="p-3 rounded-lg" style={{ background: 'rgba(196,164,124,0.06)', borderLeft: '3px solid var(--accent-gold)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-gold)' }}>Did you know?</div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{selected.funFact}</p>
            </div>
          </div>
        ) : (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '480px' }}>
            <div className="text-[48px] mb-4 opacity-60">☀️</div>
            <div className="text-[17px] font-semibold mb-2">Click a layer to explore</div>
            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              A solar module has 7 distinct layers — each with different materials, supply chains, and cost dynamics. Click any layer in the cross-section to see what it&apos;s made of.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-[10px]" style={{ color: 'var(--text-faint)' }}>
              {LAYERS.map(l => (
                <button
                  key={l.id}
                  onClick={() => onLayerSelect(l.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
