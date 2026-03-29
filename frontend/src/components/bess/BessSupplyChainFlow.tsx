'use client';

const STAGES = [
  {
    id: 'mining', name: 'Mining & Refining', icon: '⛏️',
    cost: null, costPct: null,
    description: 'Lithium from brine (Chile, Argentina) or spodumene (Australia). Nickel/cobalt from laterite ores (Indonesia, DRC). Graphite from mines (China, Mozambique).',
    details: 'DRC produces 70% of world cobalt — a key reason LFP (cobalt-free) is gaining share',
    arrow: true,
  },
  {
    id: 'cathode-prod', name: 'Cathode Production', icon: '🔬',
    cost: '$15/kWh', costPct: '23%',
    description: 'Precursor materials are mixed, calcined at 700-900°C, then milled to 5-15μm particles. LFP requires carbon coating for conductivity. NMC requires precise Ni:Mn:Co ratios.',
    details: 'Cathode production is the most energy-intensive step — 15 kWh per kg of CAM',
    arrow: true,
  },
  {
    id: 'electrode', name: 'Electrode Manufacturing', icon: '🏭',
    cost: '$4/kWh', costPct: '6%',
    description: 'Active material, binder, and conductive additive are mixed into slurry, coated onto metal foils (Al for cathode, Cu for anode), dried, and calendered to target porosity.',
    details: 'Electrode coating speed: 30-80 m/min. Faster = cheaper, but defects increase',
    arrow: true,
  },
  {
    id: 'cell-assembly', name: 'Cell Assembly', icon: '⚡',
    cost: '$8.5/kWh', costPct: '13%',
    description: 'Electrodes are stacked or wound with separator, inserted into cans, filled with electrolyte under vacuum, then sealed. Formation cycling (first charge) activates the SEI layer.',
    details: 'Formation takes 24-72 hours per batch — the biggest bottleneck in cell production',
    arrow: true,
  },
  {
    id: 'pack-assembly', name: 'Pack Assembly', icon: '🔋',
    cost: '$25/kWh', costPct: '39%',
    description: 'Cells are connected in series/parallel, BMS boards installed, thermal management plumbed, and everything housed in a fire-rated steel enclosure with HVAC and fire suppression.',
    details: 'A 5 MWh BESS container has 2,000+ cells, 100+ voltage sensors, and 50+ temperature probes',
    arrow: false,
  },
];

export default function BessSupplyChainFlow() {
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
        <span className="text-[14px] font-semibold">Total Pack Cost (LFP)</span>
        <div>
          <span className="font-price text-[22px] font-bold" style={{ color: 'var(--up)' }}>~$64</span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>/kWh</span>
          <span className="text-[11px] ml-2" style={{ color: 'var(--text-faint)' }}>BatPaC v5.0, 2025</span>
        </div>
      </div>
    </div>
  );
}
