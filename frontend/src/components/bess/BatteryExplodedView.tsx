'use client';

interface Layer {
  id: string;
  name: string;
  icon: string;
  color: string;
  thickness: string;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'cathode', name: 'Cathode', icon: '🔴',
    color: '#ef4444',
    thickness: '~70μm coating on aluminum foil',
    material: 'LFP: Lithium iron phosphate (LiFePO₄) | NMC811: Lithium nickel manganese cobalt oxide',
    purpose: 'Stores lithium ions during charging. The cathode chemistry determines the cell\'s energy density, cycle life, thermal stability, and cost. LFP is cheaper and safer; NMC811 has higher energy density.',
    costShare: '23%', costValue: '$15/kWh (LFP)',
    materials: [
      { name: 'LFP cathode active material', amount: '1.25 kg/kWh', price: '$12/kg' },
      { name: 'Lithium carbonate', amount: '0.10 kg/kWh', price: '$15/kg' },
      { name: 'Carbon additive + binder', amount: '0.05 kg/kWh', price: '$7-15/kg' },
    ],
    funFact: 'LFP was invented in 1996 by John Goodenough (who also co-invented Li-ion batteries). It was ignored for years because of low conductivity — until carbon coating solved it.',
  },
  {
    id: 'separator', name: 'Separator', icon: '🟡',
    color: '#fbbf24',
    thickness: '12-25μm microporous membrane',
    material: 'Polyethylene (PE) or polypropylene (PP) microporous film, often with ceramic coating',
    purpose: 'Prevents physical contact between cathode and anode (which would cause a short circuit and thermal runaway) while allowing lithium ions to pass through. The most critical safety component in the cell.',
    costShare: '~1%', costValue: '$0.75/kWh',
    materials: [
      { name: 'PE/PP separator film', amount: '1.5 m²/kWh', price: '$0.50/m²' },
    ],
    funFact: 'Separators are so thin (12μm = 1/5 the width of a human hair) that a single metallic particle contamination during manufacturing can cause an internal short circuit months later.',
  },
  {
    id: 'anode', name: 'Anode', icon: '⚫',
    color: '#6b7280',
    thickness: '~85μm coating on copper foil',
    material: 'Natural or synthetic graphite, increasingly blended with silicon for higher capacity',
    purpose: 'Hosts lithium ions when the battery is charged. Graphite is cheap and stable; adding silicon (5-10%) boosts capacity 15-20% but causes swelling.',
    costShare: '15%', costValue: '$9.5/kWh',
    materials: [
      { name: 'Graphite (natural/synthetic)', amount: '1.1 kg/kWh', price: '$9.5/kg' },
      { name: 'Copper current collector foil', amount: '0.8 m²/kWh', price: '$1.20/m²' },
      { name: 'Binder (SBR/CMC)', amount: '0.02 kg/kWh', price: '$10/kg' },
    ],
    funFact: 'China controls 65% of natural graphite production and 80% of synthetic graphite capacity. Synthetic graphite requires heating petroleum coke to 3000°C for weeks.',
  },
  {
    id: 'electrolyte', name: 'Electrolyte', icon: '💧',
    color: '#3b82f6',
    thickness: 'Fills all pore space in separator and electrodes',
    material: 'Lithium hexafluorophosphate (LiPF₆) dissolved in organic carbonates (EC/DMC/EMC)',
    purpose: 'Carries lithium ions between cathode and anode during charge/discharge. Must be stable across the cell\'s voltage window (2.5-4.2V) and temperature range (-20 to 60°C).',
    costShare: '~5%', costValue: '$3/kWh',
    materials: [
      { name: 'LiPF₆ electrolyte solution', amount: '0.3 L/kWh', price: '$10/L' },
    ],
    funFact: 'LiPF₆ decomposes above 60°C and reacts violently with water. That\'s why battery factories maintain <1% humidity — drier than the Sahara desert.',
  },
  {
    id: 'cell-can', name: 'Cell Housing', icon: '🔋',
    color: '#8b5cf6',
    thickness: 'Prismatic, pouch, or cylindrical can',
    material: 'Aluminum can (prismatic/pouch) or nickel-plated steel (cylindrical)',
    purpose: 'Hermetically seals the cell stack, contains electrolyte, provides terminals for current collection. Prismatic cells (used in most utility BESS) enable efficient packing.',
    costShare: '~5%', costValue: '$3.5/kWh',
    materials: [
      { name: 'Aluminum prismatic can', amount: '~2 can per kWh', price: '$1.50/can' },
      { name: 'Safety vent + PTC', amount: '1 per cell', price: '$0.30' },
    ],
    funFact: 'Tesla\'s 4680 cylindrical cells are 46mm wide and 80mm tall — 5× larger than laptop cells. Bigger cells = fewer welds = cheaper packs.',
  },
  {
    id: 'bms', name: 'Battery Management System', icon: '🖥️',
    color: '#22c55e',
    thickness: 'PCB + sensors per module and pack',
    material: 'Custom PCB with voltage/temperature sensors, cell-balancing MOSFETs, and communication IC',
    purpose: 'Monitors every cell\'s voltage, temperature, and state of charge. Prevents overcharge, over-discharge, and thermal runaway. Estimates remaining capacity (SOH) over the 20-year life.',
    costShare: '~8%', costValue: '$5/kWh',
    materials: [
      { name: 'BMS controller board', amount: '1 per module (12-16 cells)', price: '$15-40' },
      { name: 'Voltage+temp sensors', amount: '1 per cell', price: '$0.50/cell' },
    ],
    funFact: 'A BMS failure was the root cause of the 2019 Arizona battery explosion. Modern BMS can detect a failing cell 30 minutes before thermal runaway — enough time to isolate it.',
  },
  {
    id: 'thermal', name: 'Thermal Management', icon: '❄️',
    color: '#06b6d4',
    thickness: 'Liquid cooling plates + glycol loop',
    material: 'Aluminum cold plates with glycol-water coolant, heat exchangers, and pumps',
    purpose: 'Keeps cells within 20-35°C operating window. Temperature variation >5°C between cells causes uneven aging. Liquid cooling is standard for utility-scale BESS.',
    costShare: '~6%', costValue: '$4/kWh',
    materials: [
      { name: 'Aluminum cooling plates', amount: '1 plate per module', price: '$8-15' },
      { name: 'Glycol coolant loop', amount: 'Shared per rack', price: '$200-500/rack' },
    ],
    funFact: 'Tesla Megapack uses immersion cooling — cells are literally submerged in dielectric fluid. It\'s 40% more efficient than traditional cold plates.',
  },
  {
    id: 'rack', name: 'Pack Housing & Racking', icon: '🏗️',
    color: '#f59e0b',
    thickness: 'Steel rack enclosure with fire suppression',
    material: 'Powder-coated steel enclosure with seismic rating, fire suppression, and HVAC',
    purpose: 'Houses modules in a weatherproof, fire-rated enclosure. Includes ventilation, fire suppression (aerosol or gas), and structural support for seismic zones.',
    costShare: '~9%', costValue: '$6/kWh',
    materials: [
      { name: 'Steel rack enclosure', amount: '3.5 g/Wh', price: '$8/kg' },
      { name: 'Fire suppression system', amount: '1 per container', price: '$3,000-8,000' },
    ],
    funFact: 'A 100 MWh BESS container weighs ~30 tons and fits in a standard 20-ft shipping container. That\'s the energy equivalent of 300 Tesla Powerwalls.',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function BatteryExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
      {/* Diagram: stacked layers */}
      <div className="card-surface p-5">
        <div className="section-label mb-4">Battery Cell & Pack — Exploded View</div>

        <div className="space-y-1.5 max-w-md mx-auto">
          {LAYERS.map(layer => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onLayerSelect(isActive ? null : layer.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
                style={{
                  background: isActive ? `${layer.color}15` : 'rgba(255,255,255,0.02)',
                  border: isActive ? `2px solid ${layer.color}50` : '2px solid transparent',
                }}
              >
                <span className="text-[20px] w-8 text-center">{layer.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium" style={{ color: isActive ? layer.color : 'var(--text-primary)' }}>
                    {layer.name}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {layer.costValue} &middot; {layer.costShare}
                  </div>
                </div>
                <div className="w-16 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${parseInt(layer.costShare) || 3}%`, background: `${layer.color}80`, transform: `scaleX(${isActive ? 1.2 : 1})` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="font-price text-[20px] font-bold" style={{ color: 'var(--up)' }}>~$64</span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>/kWh (LFP pack, 2025)</span>
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div className="card-surface p-6 space-y-5 animate-cascade">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[24px]">{selected.icon}</span>
                <h3 className="text-[18px] font-semibold">{selected.name}</h3>
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{selected.thickness}</div>
            </div>

            <div className="flex gap-3 items-baseline">
              <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
              <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of pack cost</span>
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
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '480px' }}>
            <div className="text-[48px] mb-4 opacity-60">🔋</div>
            <div className="text-[17px] font-semibold mb-2">Click a component to explore</div>
            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Click any component on the left to see its material composition, cost contribution, and engineering details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
