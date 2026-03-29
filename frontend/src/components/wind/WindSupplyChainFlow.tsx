'use client';

const STAGES = [
  {
    id: 'raw', name: 'Raw Materials', icon: '⛏️',
    cost: null, costPct: null,
    description: 'Steel from iron ore (Australia, Brazil). Carbon fiber from polyacrylonitrile (Japan, US). Copper from mines (Chile, Peru). Rare earths from Bayan Obo mine (China, 60% of world supply).',
    details: 'A single 3MW turbine uses 85 tons of steel, 5 tons of carbon fiber, and 500g of neodymium',
    arrow: true,
  },
  {
    id: 'blades', name: 'Blade Manufacturing', icon: '🏭',
    cost: '$190/kW', costPct: '14%',
    description: 'Fiberglass and carbon fiber fabrics are laid into a 65m mold, infused with epoxy resin under vacuum, cured at 70°C for 12 hours, then trimmed, painted, and fitted with lightning receptors.',
    details: 'Each blade takes 24 hours to lay up and 12 hours to cure — a factory produces 2-3 blades per week',
    arrow: true,
  },
  {
    id: 'nacelle-assy', name: 'Nacelle Assembly', icon: '⚙️',
    cost: '$248/kW', costPct: '18%',
    description: 'Gearbox, generator, and power electronics are assembled on a main frame. Direct-drive generators with permanent magnets are wound with 3+ tons of copper. The complete nacelle weighs 80 tons.',
    details: 'Siemens Gamesa, Vestas, and GE control 75% of the global nacelle market',
    arrow: true,
  },
  {
    id: 'tower-fab', name: 'Tower Fabrication', icon: '🗼',
    cost: '$760/kW', costPct: '54%',
    description: 'Steel plates are rolled into cylinders, welded longitudinally, flanged, sandblasted, and zinc-galvanized. 3-4 sections are bolted together on site. Tower fabrication is the most material-intensive step.',
    details: 'Tower steel accounts for 80% of total turbine mass — it dominates both cost and carbon footprint',
    arrow: true,
  },
  {
    id: 'install', name: 'Site Installation', icon: '🏗️',
    cost: '$155/kW', costPct: '11%',
    description: 'Concrete foundation poured, tower sections bolted, nacelle lifted by 600-ton crane, blades attached one by one at hub height. Commissioning includes grid sync, performance testing, and SCADA calibration.',
    details: 'Installation takes 2-3 days per turbine in good weather — but weather windows are the constraint',
    arrow: false,
  },
];

export default function WindSupplyChainFlow() {
  return (
    <div className="relative">
      {/* Desktop: horizontal flow */}
      <div className="hidden lg:flex gap-0 items-stretch">
        {STAGES.map(stage => (
          <div key={stage.id} className="flex items-stretch flex-1">
            <div className="card-surface p-4 flex-1">
              <div className="text-center mb-3">
                <span className="text-[28px]">{stage.icon}</span>
              </div>
              <div className="text-[13px] font-semibold text-center mb-2">{stage.name}</div>
              {stage.cost && (
                <div className="text-center mb-2">
                  <span className="font-price text-[15px] font-bold" style={{ color: 'var(--up)' }}>{stage.cost}</span>
                  <span className="text-[10px] ml-1" style={{ color: 'var(--text-faint)' }}>{stage.costPct}</span>
                </div>
              )}
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{stage.description}</p>
              {stage.details && (
                <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--accent-gold)' }}>{stage.details}</p>
              )}
            </div>
            {stage.arrow && (
              <div className="flex items-center px-1" style={{ color: 'var(--text-faint)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="lg:hidden space-y-0">
        {STAGES.map(stage => (
          <div key={stage.id}>
            <div className="card-surface p-4 flex gap-3">
              <span className="text-[24px] mt-0.5">{stage.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-semibold">{stage.name}</span>
                  {stage.cost && (
                    <span className="font-price text-[13px] font-bold" style={{ color: 'var(--up)' }}>{stage.cost}</span>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{stage.description}</p>
              </div>
            </div>
            {stage.arrow && (
              <div className="flex justify-center py-1" style={{ color: 'var(--text-faint)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total cost bar */}
      <div className="mt-4 card-surface p-4 flex items-center justify-between">
        <span className="text-[14px] font-semibold">Total Installed Cost (Onshore)</span>
        <div>
          <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>$1,401</span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>/kW</span>
          <span className="text-[11px] ml-2" style={{ color: 'var(--text-faint)' }}>3MW reference, 2025</span>
        </div>
      </div>
    </div>
  );
}
