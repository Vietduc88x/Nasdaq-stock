'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  color: string;
  gradientTop: string;
  gradientBottom: string;
  edgeColor: string;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'glass', name: 'Tempered Glass', color: '#a8d8ea',
    gradientTop: '#c5e8f7', gradientBottom: '#7fb8d0', edgeColor: '#5a9ab5',
    material: 'Low-iron tempered glass (3.2mm)',
    purpose: 'Protects cells from weather, hail, and UV. Transmits >90% of sunlight while surviving 25+ years outdoors.',
    costShare: '6.7%', costValue: '$0.012/Wp',
    materials: [{ name: 'Silica sand (SiO₂)', amount: '5.6 g/Wp', price: '$0.80/kg' }],
    funFact: 'Solar glass is 10× clearer than window glass — iron content must be below 0.01%.',
  },
  {
    id: 'eva-front', name: 'EVA Encapsulant (Front)', color: '#e8dcc8',
    gradientTop: '#f0e6d4', gradientBottom: '#d4c8b0', edgeColor: '#b8a890',
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Bonds glass to cells. Provides electrical insulation and cushioning against thermal stress.',
    costShare: '4.4%', costValue: '$0.008/Wp',
    materials: [{ name: 'EVA resin', amount: '1.2 g/Wp (both layers)', price: '$1.85/kg' }],
    funFact: 'Laminated at 150°C for 15 minutes in a vacuum press. Turns yellow after 25 years of UV exposure.',
  },
  {
    id: 'cells', name: 'Solar Cells + Interconnects', color: '#1a1a2e',
    gradientTop: '#2a2a40', gradientBottom: '#0a0a1e', edgeColor: '#0a0a18',
    material: 'Monocrystalline silicon wafers + silver paste contacts + copper ribbons',
    purpose: 'Converts sunlight to electricity via the photovoltaic effect. Each cell produces ~0.5V and ~10W.',
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
    id: 'eva-back', name: 'EVA Encapsulant (Back)', color: '#e8dcc8',
    gradientTop: '#f0e6d4', gradientBottom: '#d4c8b0', edgeColor: '#b8a890',
    material: 'Ethylene-vinyl acetate film (0.45mm)',
    purpose: 'Seals cells from moisture on the back side. Same material as front EVA.',
    costShare: '(incl. above)', costValue: '—',
    materials: [{ name: 'EVA resin', amount: '(included in front EVA total)', price: '—' }],
    funFact: 'The front and back EVA sheets are identical — they melt and fuse around the cells during lamination.',
  },
  {
    id: 'backsheet', name: 'Backsheet', color: '#d0d0d0',
    gradientTop: '#e0e0e0', gradientBottom: '#b8b8b8', edgeColor: '#999',
    material: 'Multi-layer polymer film (Tedlar/PET/Tedlar)',
    purpose: 'Moisture barrier and electrical insulation. White surface reflects unused light back through cells.',
    costShare: '~2%', costValue: '$0.004/Wp',
    materials: [{ name: 'PVF/PET/PVF layers', amount: '~0.8 g/Wp', price: '~$3/m²' }],
    funFact: 'Bifacial modules replace the backsheet with glass, gaining 5–15% more energy from ground-reflected light.',
  },
  {
    id: 'frame', name: 'Aluminum Frame', color: '#b0b0b0',
    gradientTop: '#c8c8c8', gradientBottom: '#888', edgeColor: '#666',
    material: 'Anodized aluminum 6063 alloy (35mm depth)',
    purpose: 'Structural support and mounting interface. Must withstand 5,400 Pa snow/wind loads.',
    costShare: '5.3%', costValue: '$0.0095/Wp',
    materials: [{ name: 'Aluminum 6063', amount: '1.5 g/Wp (~1.8 kg/module)', price: '$1.15/lb' }],
    funFact: 'Each frame uses ~1.8 kg of aluminum — about the weight of 3 soda cans.',
  },
];

// Isometric projection helpers
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const COS = Math.cos(ISO_ANGLE);
const SIN = Math.sin(ISO_ANGLE);

function isoProject(x: number, y: number, z: number): [number, number] {
  return [
    300 + (x - y) * COS,
    80 + (x + y) * SIN - z,
  ];
}

function makeIsoRect(x: number, y: number, z: number, w: number, h: number): string {
  const [x1, y1] = isoProject(x, y, z);
  const [x2, y2] = isoProject(x + w, y, z);
  const [x3, y3] = isoProject(x + w, y + h, z);
  const [x4, y4] = isoProject(x, y + h, z);
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}

function makeIsoRightFace(x: number, y: number, z: number, w: number, h: number, depth: number): string {
  const [x1, y1] = isoProject(x + w, y, z);
  const [x2, y2] = isoProject(x + w, y + h, z);
  const [x3, y3] = isoProject(x + w, y + h, z - depth);
  const [x4, y4] = isoProject(x + w, y, z - depth);
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}

function makeIsoFrontFace(x: number, y: number, z: number, w: number, h: number, depth: number): string {
  const [x1, y1] = isoProject(x, y + h, z);
  const [x2, y2] = isoProject(x + w, y + h, z);
  const [x3, y3] = isoProject(x + w, y + h, z - depth);
  const [x4, y4] = isoProject(x, y + h, z - depth);
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function ModuleExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  const panelW = 200;
  const panelH = 160;
  const layerThicknesses: Record<string, number> = {
    glass: 12, 'eva-front': 5, cells: 8, 'eva-back': 5, backsheet: 4, frame: 10,
  };

  const gaps = 28; // Gap between exploded layers
  let currentZ = 0;

  const layerGeometries = LAYERS.map(layer => {
    const thickness = layerThicknesses[layer.id] || 8;
    const z = currentZ;
    currentZ += thickness + gaps;
    return { ...layer, z, thickness };
  });

  const svgHeight = currentZ + 80;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
      {/* Isometric Exploded View */}
      <div className="card-surface p-5 overflow-hidden">
        <div className="section-label mb-3">Solar PV Module — Exploded View</div>

        <svg viewBox={`0 0 600 ${svgHeight}`} className="w-full" style={{ maxHeight: '560px' }}>
          <defs>
            {layerGeometries.map(layer => (
              <linearGradient key={`g-${layer.id}`} id={`grad-${layer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={layer.gradientTop} />
                <stop offset="100%" stopColor={layer.gradientBottom} />
              </linearGradient>
            ))}
            <filter id="shadow">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
            </filter>
          </defs>

          {layerGeometries.map((layer, i) => {
            const isActive = activeLayer === layer.id;
            const isOther = activeLayer !== null && !isActive;
            const topFace = makeIsoRect(0, 0, layer.z + layer.thickness, panelW, panelH);
            const rightFace = makeIsoRightFace(0, 0, layer.z + layer.thickness, panelW, panelH, layer.thickness);
            const frontFace = makeIsoFrontFace(0, 0, layer.z + layer.thickness, panelW, panelH, layer.thickness);

            // Label position
            const [labelX, labelY] = isoProject(-30, panelH / 2, layer.z + layer.thickness / 2);

            return (
              <g
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="cursor-pointer"
                style={{
                  opacity: isOther ? 0.3 : 1,
                  transition: 'opacity 0.4s, filter 0.4s',
                  filter: isActive ? 'brightness(1.15) drop-shadow(0 0 8px rgba(255,255,255,0.15))' : 'none',
                }}
              >
                {/* Front face (bottom edge) */}
                <polygon
                  points={frontFace}
                  fill={layer.edgeColor}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />

                {/* Right face (side edge) */}
                <polygon
                  points={rightFace}
                  fill={layer.edgeColor}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                  style={{ opacity: 0.8 }}
                />

                {/* Top face */}
                <polygon
                  points={topFace}
                  fill={`url(#grad-${layer.id})`}
                  stroke={isActive ? '#fff' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  filter="url(#shadow)"
                />

                {/* Cell grid overlay on cells layer */}
                {layer.id === 'cells' && (() => {
                  const cellRows = 6;
                  const cellCols = 10;
                  const elements = [];
                  for (let r = 0; r < cellRows; r++) {
                    for (let c = 0; c < cellCols; c++) {
                      const cx = (c + 0.5) * (panelW / cellCols);
                      const cy = (r + 0.5) * (panelH / cellRows);
                      const [px, py] = isoProject(cx, cy, layer.z + layer.thickness);
                      elements.push(
                        <circle key={`cell-${r}-${c}`} cx={px} cy={py} r="1" fill="rgba(255,255,255,0.08)" />
                      );
                    }
                  }
                  // Busbars
                  for (let b = 1; b <= 3; b++) {
                    const bx = b * (panelW / 4);
                    const [x1, y1] = isoProject(bx, 5, layer.z + layer.thickness);
                    const [x2, y2] = isoProject(bx, panelH - 5, layer.z + layer.thickness);
                    elements.push(
                      <line key={`bus-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(192,192,192,0.25)" strokeWidth="1" />
                    );
                  }
                  return elements;
                })()}

                {/* Glass reflection */}
                {layer.id === 'glass' && (() => {
                  const [rx1, ry1] = isoProject(20, 15, layer.z + layer.thickness);
                  const [rx2, ry2] = isoProject(80, 15, layer.z + layer.thickness);
                  const [rx3, ry3] = isoProject(60, 40, layer.z + layer.thickness);
                  const [rx4, ry4] = isoProject(10, 40, layer.z + layer.thickness);
                  return (
                    <polygon
                      points={`${rx1},${ry1} ${rx2},${ry2} ${rx3},${ry3} ${rx4},${ry4}`}
                      fill="rgba(255,255,255,0.15)"
                    />
                  );
                })()}

                {/* Label */}
                <text
                  x={labelX - 10}
                  y={labelY}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={isActive ? '#fff' : 'rgba(255,255,255,0.45)'}
                  fontSize="10.5"
                  fontWeight={isActive ? 600 : 400}
                  fontFamily="Inter, sans-serif"
                >
                  {layer.name}
                </text>
                {/* Connector dot */}
                <circle
                  cx={labelX - 4}
                  cy={labelY}
                  r="2"
                  fill={isActive ? layer.color : 'rgba(255,255,255,0.2)'}
                />
                {/* Connector line */}
                <line
                  x1={labelX}
                  y1={labelY}
                  x2={labelX + 20}
                  y2={labelY}
                  stroke={isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
              </g>
            );
          })}
        </svg>

        {/* Layer buttons */}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {LAYERS.map(l => (
            <button
              key={l.id}
              onClick={() => onLayerSelect(activeLayer === l.id ? null : l.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: activeLayer === l.id ? `${l.color}30` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeLayer === l.id ? `${l.color}55` : 'var(--border-subtle)'}`,
                color: activeLayer === l.id ? '#fff' : 'var(--text-muted)',
              }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
              {l.name.replace(' (Front)', '').replace(' (Back)', '')}
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
            {selected.costValue !== '—' && (
              <div className="flex gap-3">
                <span className="font-price text-[16px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
                <span className="text-[12px] self-center" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of total module cost</span>
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
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '460px' }}>
            <div className="text-[48px] mb-4 opacity-60">☀️</div>
            <div className="text-[17px] font-semibold mb-2">Click a layer to explore</div>
            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Each layer has different materials, costs, and supply chain dynamics. Click any layer in the exploded view or use the buttons below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
