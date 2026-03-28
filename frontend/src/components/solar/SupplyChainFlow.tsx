'use client';

const STAGES = [
  {
    id: 'sand',
    name: 'Quartz Sand',
    icon: '🏜️',
    cost: null,
    description: 'High-purity silica sand (SiO₂) mined from quarries',
    arrow: true,
  },
  {
    id: 'polysilicon',
    name: 'Polysilicon',
    icon: '🪨',
    cost: '$0.023/Wp',
    costPct: '12.8%',
    description: 'Sand is refined to 99.9999% pure silicon using the Siemens process at 1100°C. Consumes 40 kWh/kg of electricity.',
    details: 'Major producers: China (80%), Germany, USA',
    arrow: true,
  },
  {
    id: 'ingot-wafer',
    name: 'Ingot & Wafer',
    icon: '💎',
    cost: '$0.033/Wp',
    costPct: '18.3%',
    description: 'Polysilicon is melted and grown into a single-crystal ingot (Czochralski method), then sliced into 130μm-thin wafers using diamond wire saws.',
    details: 'Kerf loss (sawing waste): ~30% of silicon is lost as dust',
    arrow: true,
  },
  {
    id: 'cell',
    name: 'Solar Cell',
    icon: '⚡',
    cost: '$0.040/Wp',
    costPct: '22.2%',
    description: 'Wafers are doped with phosphorus and boron to create a p-n junction. Silver paste is screen-printed for contacts. Anti-reflective coating (SiNx) is applied.',
    details: 'Silver is the #1 cost swing material at $853/kg',
    arrow: true,
  },
  {
    id: 'module',
    name: 'Module Assembly',
    icon: '☀️',
    cost: '$0.083/Wp',
    costPct: '46.1%',
    description: 'Cells are soldered with copper ribbons, laminated between EVA and glass, framed with aluminum, and fitted with junction box and cables.',
    details: 'Largest stage by cost — dominated by glass, aluminum, and EVA',
    arrow: false,
  },
];

export default function SupplyChainFlow() {
  return (
    <div className="relative">
      {/* Desktop: horizontal flow */}
      <div className="hidden lg:flex gap-0 items-stretch">
        {STAGES.map((stage, i) => (
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
        {STAGES.map((stage, i) => (
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
        <span className="text-[14px] font-semibold">Total Module Cost (EXW)</span>
        <div>
          <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>$0.180</span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>/Wp</span>
          <span className="text-[11px] ml-2" style={{ color: 'var(--text-faint)' }}>Vietnam, TOPCon, 2025</span>
        </div>
      </div>
    </div>
  );
}
