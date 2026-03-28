'use client';

import { useState } from 'react';

interface FormulaStep {
  id: string;
  name: string;
  formula: string;
  explanation: string;
  example: string;
  result: string;
}

const FORMULAS: FormulaStep[] = [
  {
    id: 'electricity',
    name: 'Electricity Cost',
    formula: 'Electricity = Consumption (kWh/unit) × Price ($/kWh)',
    explanation: 'How much electricity the factory uses to produce one unit. Polysilicon is the most electricity-intensive stage at 40 kWh/kg — that\'s enough to power a house for a day.',
    example: 'Polysilicon: 40 kWh/kg × $0.07/kWh = $2.80/kg',
    result: 'For Vietnam: $2.80/kg × 2.1 g/W ÷ 1000 = $0.0059/Wp',
  },
  {
    id: 'materials',
    name: 'Material Cost',
    formula: 'Materials = Quantity (g/Wp) × Price ($/g)',
    explanation: 'The raw material consumed per watt produced. Includes the primary feedstock (silicon metal for polysilicon, silver paste for cells) and other consumables (crucibles, diamond wire, gases).',
    example: 'Silver in cells: 11.5 mg/Wp × $853/kg = $0.0098/Wp',
    result: 'Silver alone accounts for 4.7% of total module cost',
  },
  {
    id: 'equipment',
    name: 'Equipment Depreciation',
    formula: 'Equipment = CAPEX ($/kW) ÷ Lifetime (years)',
    explanation: 'Capital cost of manufacturing equipment spread over its useful life. Cell equipment is replaced every 5 years due to rapid technology changes. A 4 GW wafer factory costs ~$160M in equipment.',
    example: 'Wafer equipment: $40/kW ÷ 7 years = $5.71/kW/year',
    result: 'Converted to $/Wp: $0.0057/Wp',
  },
  {
    id: 'building',
    name: 'Building & Facilities',
    formula: 'Building = Total cost ($/kWp) ÷ Lifetime (years)',
    explanation: 'Factory construction costs depreciated over 20 years using straight-line method. Includes the building, clean rooms, water treatment, and site infrastructure.',
    example: 'Cell factory: $30/kWp ÷ 20 years = $1.50/kWp/year',
    result: 'Converted to $/Wp: $0.0015/Wp',
  },
  {
    id: 'labour',
    name: 'Labour Cost',
    formula: 'Labour = Workers per Wp × Average Salary ($/year)',
    explanation: 'Number of factory workers needed per unit of capacity multiplied by their annual salary. China has lower salaries ($12K/yr) but similar worker-per-GW ratios as other countries.',
    example: 'Cell manufacturing: 0.000000215 workers/W × $9,000/yr',
    result: '$0.0019/Wp — labour is a relatively small cost driver',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    formula: 'Maintenance = 4% × (Equipment CAPEX + Building CAPEX)',
    explanation: 'Annual upkeep of equipment and facilities. Based on NREL industry data, typically 4% of total capital expenditure per year.',
    example: '4% × ($40 + $30)/kWp = $2.80/kWp/year',
    result: '$0.0028/Wp',
  },
  {
    id: 'overheads',
    name: 'Overheads (10%)',
    formula: 'Overheads = 10% × Sum of all direct costs',
    explanation: 'R&D expenses, selling costs, general & administrative (SG&A), and other indirect costs. IRENA assumes this is 10% of total direct production costs.',
    example: 'If direct costs = $0.032/Wp → Overheads = $0.0032/Wp',
    result: 'Covers R&D for next-gen technology, marketing, management',
  },
  {
    id: 'profit',
    name: 'Operating Profit (15%)',
    formula: 'Profit = 15% × Sum of all costs including overheads',
    explanation: 'The manufacturer\'s profit margin. IRENA uses 15% based on NREL industry analysis. Assumes 90% of production is sold (10% lost to defects, unsold stock).',
    example: 'If all costs = $0.035/Wp → Profit = $0.0053/Wp',
    result: 'Final EXW (factory gate) price includes this margin',
  },
];

const TOTAL_FORMULA = `
Final Module Cost ($/Wp) =
  Σ for each stage (Polysilicon + Wafer + Cell + Module):
    Electricity + Materials + Equipment + Building
    + Labour + Maintenance + Overheads + Profit
    + ESG Certification (module only)
`;

export default function CostFormulaExplainer() {
  const [expandedId, setExpandedId] = useState<string | null>('electricity');

  return (
    <div className="space-y-4">
      {/* Formula overview */}
      <div className="card-surface p-5">
        <div className="section-label mb-3">Master Formula</div>
        <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--up)' }}>
          {TOTAL_FORMULA.trim()}
        </pre>
        <p className="text-[11px] mt-3" style={{ color: 'var(--text-faint)' }}>
          Source: IRENA (2026), Solar PV Supply Chain Cost Tool. Each of the 4 supply chain stages computes its cost independently, then they sum to the total module cost.
        </p>
      </div>

      {/* Individual formula cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMULAS.map((f, i) => {
          const isExpanded = expandedId === f.id;
          return (
            <div
              key={f.id}
              className="card-surface p-4 cursor-pointer transition-all"
              style={{
                borderColor: isExpanded ? 'var(--border-hover)' : undefined,
              }}
              onClick={() => setExpandedId(isExpanded ? null : f.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(52,199,89,0.12)', color: 'var(--up)' }}>
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold">{f.name}</span>
                </div>
                <svg
                  className="w-4 h-4 transition-transform"
                  style={{ color: 'var(--text-faint)', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Formula */}
              <div className="font-mono text-[11px] px-3 py-2 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                {f.formula}
              </div>

              {isExpanded && (
                <div className="space-y-3 mt-3 animate-cascade">
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {f.explanation}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Example</span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>{f.example}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded" style={{ background: 'rgba(52,199,89,0.08)', color: 'var(--up)' }}>Result</span>
                      <span className="font-mono text-[11px] font-medium" style={{ color: 'var(--up)' }}>{f.result}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
