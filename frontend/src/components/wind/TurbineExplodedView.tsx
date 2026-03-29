'use client';

interface Layer {
  id: string;
  name: string;
  icon: string;
  color: string;
  specs: string;
  material: string;
  purpose: string;
  costShare: string;
  costValue: string;
  materials: { name: string; amount: string; price: string }[];
  funFact: string;
}

const LAYERS: Layer[] = [
  {
    id: 'blade', name: 'Rotor Blades (×3)', icon: '🌀',
    color: '#34C759',
    specs: '65m length, ~20 tons each',
    material: 'Fiberglass/epoxy shell with carbon fiber spar caps, balsa/foam core, lightning protection',
    purpose: 'Captures wind energy and converts it to rotational force. Blade aerodynamic profile is the primary determinant of capacity factor. Longer blades = more swept area = more energy, but also more structural load.',
    costShare: '14%', costValue: '$190/kW',
    materials: [
      { name: 'Fiberglass/epoxy composite', amount: '15 kg/kW', price: '$4/kg' },
      { name: 'Carbon fiber spar caps', amount: '5 kg/kW', price: '$15/kg' },
      { name: 'Epoxy resin + adhesive', amount: '~3 kg/kW', price: '$6/kg' },
      { name: 'Balsa/PVC foam core', amount: '~2 kg/kW', price: '$8/kg' },
    ],
    funFact: 'A single 65m blade tip moves at 300 km/h. The largest blades (115m, GE Haliade-X) are longer than a football field and cannot be transported by road — they are manufactured near ports.',
  },
  {
    id: 'nacelle', name: 'Nacelle Assembly', icon: '⚙️',
    color: '#3B82F6',
    specs: '~80 tons, 12m × 5m × 5m',
    material: 'Gearbox, generator, power electronics, yaw system, and fiberglass/aluminum housing',
    purpose: 'Houses the drivetrain that converts blade rotation into electricity. The gearbox steps up speed from ~15 RPM to ~1,800 RPM for the generator. Direct-drive turbines eliminate the gearbox using permanent magnet generators (heavier but more reliable).',
    costShare: '18%', costValue: '$248/kW',
    materials: [
      { name: 'Copper (generator windings)', amount: '3.2 kg/kW', price: '$5.50/lb' },
      { name: 'Neodymium oxide (magnets)', amount: '500 g/kW', price: '$125/kg' },
      { name: 'Dysprosium oxide (magnets)', amount: '50 g/kW', price: '$285/kg' },
      { name: 'Aluminum (nacelle housing)', amount: '2.5 kg/kW', price: '$1.45/lb' },
    ],
    funFact: 'Neodymium magnets are so strong that a single 50mm cube can lift 50 kg. Direct-drive turbines use ~500 kg of rare earth magnets — that\'s 95% sourced from China.',
  },
  {
    id: 'tower', name: 'Steel Tower', icon: '🏗️',
    color: '#FBBF24',
    specs: '100m hub height, 3-4 tubular sections',
    material: 'S355 structural steel tubular sections, bolted flanges, internal ladder/elevator, zinc galvanizing',
    purpose: 'Elevates the rotor to capture stronger, more consistent winds at height. Wind speed increases ~25% between 60m and 100m hub height. Tower must withstand extreme loads (5,000 kN bending moment in 50-year storm).',
    costShare: '54%', costValue: '$760/kW',
    materials: [
      { name: 'Structural steel (S355)', amount: '85 kg/kW', price: '$800/ton' },
      { name: 'Zinc galvanizing', amount: '0.8 kg/kW', price: '$2.60/lb' },
      { name: 'Tower fabrication + welding', amount: '—', price: '$45/kW' },
      { name: 'Heavy transport to site', amount: '—', price: '$30/kW' },
    ],
    funFact: 'An 80-ton tower section is the heaviest single component. Concrete-steel hybrid towers can reach 160m hub height — 50% taller than tubular steel — unlocking 15% more energy.',
  },
  {
    id: 'electrical', name: 'Electrical Systems', icon: '⚡',
    color: '#A855F7',
    specs: 'Medium-voltage (33kV) collection system',
    material: 'In-tower cabling, step-up transformer, switchgear, SCADA, met mast, fiber optics',
    purpose: 'Converts variable-frequency generator output to grid-frequency AC, steps up voltage for efficient transmission, and provides monitoring/control. SCADA system monitors 200+ parameters per turbine in real time.',
    costShare: '3%', costValue: '$48/kW',
    materials: [
      { name: 'Copper cabling (in-tower)', amount: '~500 g/kW', price: '$5.50/lb' },
      { name: 'Power transformer', amount: '1 per turbine', price: '$15-25/kW' },
      { name: 'SCADA + sensors', amount: '1 system per farm', price: '$8/kW pro-rata' },
    ],
    funFact: 'Modern turbines have 500+ sensors feeding a SCADA system that predicts failures 2 weeks ahead. One offshore farm generates 50 TB of data per year.',
  },
  {
    id: 'foundation', name: 'Foundation & Installation', icon: '🏛️',
    color: '#ec4899',
    specs: '500m³ reinforced concrete, 80 tons rebar',
    material: 'Reinforced concrete gravity foundation (onshore) or monopile/jacket (offshore)',
    purpose: 'Transfers all turbine loads — weight (400+ tons), wind thrust, blade torque — into the ground. Must resist uplift forces in extreme winds. Foundation design depends on soil conditions, seismic zone, and turbine loads.',
    costShare: '11%', costValue: '$155/kW',
    materials: [
      { name: 'Concrete foundation', amount: '~500 m³ per turbine', price: '$65/kW' },
      { name: 'Steel rebar', amount: '~80 tons per turbine', price: '$20/kW' },
      { name: 'Crane erection', amount: '600-ton mobile crane', price: '$45/kW' },
      { name: 'Civil works + commissioning', amount: 'Roads, hardstanding', price: '$45/kW' },
    ],
    funFact: 'The foundation concrete cures for 28 days before the tower can be erected. A 600-ton crawler crane rental costs $30,000/day — weather delays are the #1 installation cost risk.',
  },
];

interface Props {
  activeLayer: string | null;
  onLayerSelect: (id: string | null) => void;
}

export default function TurbineExplodedView({ activeLayer, onLayerSelect }: Props) {
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
      {/* Component list */}
      <div className="card-surface p-5">
        <div className="section-label mb-4">Wind Turbine — Component Breakdown</div>

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
                <div className="w-20 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${parseInt(layer.costShare)}%`, background: `${layer.color}80` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="font-price text-[20px] font-bold" style={{ color: 'var(--up)' }}>$1,401</span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>/kW installed (onshore, 2025)</span>
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
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{selected.specs}</div>
            </div>

            <div className="flex gap-3 items-baseline">
              <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>{selected.costValue}</span>
              <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>{selected.costShare} of installed cost</span>
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
            <div className="text-[48px] mb-4 opacity-60">💨</div>
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
