'use client';

import { useState, useMemo } from 'react';

interface InputParam {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  category: 'material' | 'energy' | 'manufacturing' | 'business';
  tooltip: string;
}

const PARAMS: InputParam[] = [
  // Materials
  { id: 'siliconPrice', label: 'Silicon Metal', unit: '$/kg', min: 0.5, max: 5, step: 0.1, defaultValue: 1.70, category: 'material', tooltip: 'Price of metallurgical-grade silicon used for polysilicon production' },
  { id: 'silverPrice', label: 'Silver Paste', unit: '$/kg', min: 400, max: 1500, step: 10, defaultValue: 853, category: 'material', tooltip: 'Price of silver paste for cell metallization contacts' },
  { id: 'aluminumPrice', label: 'Aluminum Frame', unit: '$/lb', min: 0.5, max: 3, step: 0.05, defaultValue: 1.15, category: 'material', tooltip: 'Price of aluminum alloy for module frame extrusion' },
  { id: 'glassPrice', label: 'Solar Glass', unit: '$/kg', min: 0.3, max: 2, step: 0.05, defaultValue: 0.80, category: 'material', tooltip: 'Price of low-iron tempered glass for module front cover' },
  { id: 'evaPrice', label: 'EVA Encapsulant', unit: '$/kg', min: 0.5, max: 4, step: 0.05, defaultValue: 1.85, category: 'material', tooltip: 'Price of EVA film for cell encapsulation' },

  // Energy
  { id: 'electricityPrice', label: 'Electricity', unit: '$/kWh', min: 0.02, max: 0.20, step: 0.005, defaultValue: 0.07, category: 'energy', tooltip: 'Industrial electricity price at the manufacturing location' },

  // Manufacturing
  { id: 'avgSalary', label: 'Worker Salary', unit: '$/yr', min: 3000, max: 60000, step: 500, defaultValue: 9000, category: 'manufacturing', tooltip: 'Average annual salary of factory workers' },
  { id: 'cellEfficiency', label: 'Cell Efficiency', unit: '%', min: 20, max: 28, step: 0.1, defaultValue: 25.3, category: 'manufacturing', tooltip: 'Solar cell conversion efficiency (TOPCon ~25.3%, future ~26%)' },

  // Business
  { id: 'overheadPct', label: 'Overheads', unit: '%', min: 5, max: 20, step: 0.5, defaultValue: 10, category: 'business', tooltip: 'R&D, SG&A, and administrative expenses as % of direct cost' },
  { id: 'profitPct', label: 'Profit Margin', unit: '%', min: 5, max: 25, step: 0.5, defaultValue: 15, category: 'business', tooltip: 'Operating profit margin applied to total cost' },
];

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  material: { label: 'Raw Materials', icon: '🪨', color: '#3b82f6' },
  energy: { label: 'Energy', icon: '⚡', color: '#f59e0b' },
  manufacturing: { label: 'Manufacturing', icon: '🏭', color: '#8b5cf6' },
  business: { label: 'Business', icon: '📊', color: '#ec4899' },
};

// Simplified IRENA cost model
function calculateModuleCost(values: Record<string, number>) {
  const {
    siliconPrice, silverPrice, aluminumPrice, glassPrice, evaPrice,
    electricityPrice, avgSalary, cellEfficiency,
    overheadPct, profitPct
  } = values;

  const eff = cellEfficiency / 100;
  const overhead = overheadPct / 100;
  const profit = profitPct / 100;

  // Stage 1: Polysilicon
  const polyElectricity = 40 * electricityPrice; // kWh/kg * $/kWh = $/kg
  const polyMaterials = siliconPrice + 1.2; // silicon metal + other
  const polyEquipment = 15 / 10; // equipment/lifetime
  const polyBuilding = 5 / 20;
  const polyMaint = 0.04 * (15 + 5);
  const polyLabour = 0.000021 * avgSalary;
  const polyDirectPerKg = polyElectricity + polyMaterials + polyEquipment + polyBuilding + polyMaint + polyLabour;
  const polyPerKg = polyDirectPerKg * (1 + overhead + profit);
  const polyCostPerWp = polyPerKg * 2.1 / 1000; // 2.1 g/W conversion

  // Stage 2: Wafer
  const waferArea = 0.03822; // m2
  const wattsPerWafer = waferArea * 1000 * eff;
  const waferElec = (0.9 * electricityPrice) / wattsPerWafer;
  const waferMaterials = 0.015; // other materials $/Wp (crucibles, diamond wire)
  const waferEquip = (40 / 1000) / 7;
  const waferBuild = (30 / 1000) / 20;
  const waferMaint = 0.04 * ((40 + 30) / 1000);
  const waferLabour = 0.000000215 * avgSalary;
  const waferDirect = waferElec + waferMaterials + waferEquip + waferBuild + waferMaint + waferLabour;
  const waferCostPerWp = waferDirect * (1 + overhead + profit);

  // Stage 3: Cell
  const silverConsumption = 0.0000115; // 11.5 mg/Wp in kg/Wp
  const cellElec = 0.056 * electricityPrice;
  const cellSilver = silverConsumption * silverPrice;
  const cellEquip = (35 / 1000) / 5;
  const cellBuild = (30 / 1000) / 20;
  const cellMaint = 0.04 * ((35 + 30) / 1000);
  const cellLabour = 0.000000215 * avgSalary;
  const cellDirect = cellElec + cellSilver + cellEquip + cellBuild + cellMaint + cellLabour;
  const cellCostPerWp = cellDirect * (1 + overhead + profit);

  // Stage 4: Module Assembly
  const moduleElec = (0.025 * electricityPrice) / (9.67 * 72); // per module / watts per module
  const glassPerWp = (glassPrice * 5.6) / 1000; // 5.6 g/Wp
  const evaPerWp = (evaPrice * 1.2) / 1000; // 1.2 g/Wp
  const alPerWp = (aluminumPrice * 1.5 / 453.592); // 1.5 g/Wp, convert lb to g
  const otherModule = glassPerWp + evaPerWp + alPerWp + 0.015; // + backsheet, jbox etc
  const moduleEquip = (13 / 1000) / 5;
  const moduleBuild = (20 / 1000) / 20;
  const moduleMaint = 0.04 * ((13 + 20) / 1000);
  const moduleLabour = 0.000000264 * avgSalary;
  const esg = 0.0006;
  const moduleDirect = moduleElec + otherModule + moduleEquip + moduleBuild + moduleMaint + moduleLabour + esg;
  const moduleCostPerWp = moduleDirect * (1 + overhead + profit);

  const total = polyCostPerWp + waferCostPerWp + cellCostPerWp + moduleCostPerWp;

  return {
    total: Math.round(total * 10000) / 10000,
    stages: [
      { name: 'Polysilicon', cost: Math.round(polyCostPerWp * 10000) / 10000, color: '#34C759' },
      { name: 'Wafer', cost: Math.round(waferCostPerWp * 10000) / 10000, color: '#3b82f6' },
      { name: 'Cell', cost: Math.round(cellCostPerWp * 10000) / 10000, color: '#f59e0b' },
      { name: 'Module', cost: Math.round(moduleCostPerWp * 10000) / 10000, color: '#a855f7' },
    ],
  };
}

export default function CostCalculator() {
  const defaults = Object.fromEntries(PARAMS.map(p => [p.id, p.defaultValue]));
  const [values, setValues] = useState<Record<string, number>>(defaults);

  const result = useMemo(() => calculateModuleCost(values), [values]);
  const baseline = useMemo(() => calculateModuleCost(defaults), []);
  const delta = result.total - baseline.total;
  const deltaPct = (delta / baseline.total) * 100;

  function updateValue(id: string, val: number) {
    setValues(prev => ({ ...prev, [id]: val }));
  }

  function resetAll() {
    setValues(defaults);
  }

  const isChanged = Object.keys(values).some(k => values[k] !== defaults[k]);

  // Group params by category
  const grouped = new Map<string, InputParam[]>();
  for (const p of PARAMS) {
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category)!.push(p);
  }

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div className="card-surface p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="section-label mb-2">Your Module Cost Estimate</div>
            <div className="flex items-baseline gap-3">
              <span className="font-price text-[36px] font-bold" style={{ color: delta > 0 ? 'var(--down)' : delta < 0 ? 'var(--up)' : 'var(--text-primary)' }}>
                ${result.total.toFixed(3)}
              </span>
              <span className="text-[14px]" style={{ color: 'var(--text-muted)' }}>/Wp</span>
              {isChanged && (
                <span className="font-price text-[14px] font-semibold" style={{ color: delta > 0 ? 'var(--down)' : 'var(--up)' }}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(4)} ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
                </span>
              )}
            </div>
            {!isChanged && (
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>
                Baseline: Vietnam, TOPCon, 2025 (IRENA reference)
              </div>
            )}
          </div>
          {isChanged && (
            <button
              onClick={resetAll}
              className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              Reset to baseline
            </button>
          )}
        </div>

        {/* Stage waterfall bar */}
        <div className="mt-4 flex gap-0.5 rounded-lg overflow-hidden" style={{ height: '32px' }}>
          {result.stages.map(stage => {
            const pct = (stage.cost / result.total) * 100;
            return (
              <div
                key={stage.name}
                className="relative flex items-center justify-center transition-all duration-300"
                style={{ width: `${pct}%`, background: stage.color, minWidth: pct > 5 ? 0 : '2px' }}
                title={`${stage.name}: $${stage.cost.toFixed(4)}/Wp (${pct.toFixed(1)}%)`}
              >
                {pct > 12 && (
                  <span className="text-[9px] font-semibold text-white drop-shadow-sm">
                    {stage.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {result.stages.map(stage => (
            <div key={stage.name} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: stage.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{stage.name}</span>
              <span className="font-price font-medium">${stage.cost.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input Sliders by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from(grouped.entries()).map(([category, params]) => {
          const meta = CATEGORY_META[category];
          return (
            <div key={category} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[16px]">{meta.icon}</span>
                <span className="text-[13px] font-semibold">{meta.label}</span>
              </div>

              <div className="space-y-4">
                {params.map(param => {
                  const val = values[param.id];
                  const def = param.defaultValue;
                  const changed = val !== def;
                  const pctChange = ((val - def) / def) * 100;
                  const progress = ((val - param.min) / (param.max - param.min)) * 100;

                  return (
                    <div key={param.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {param.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="font-price text-[13px] font-semibold" style={{ color: changed ? (pctChange > 0 ? 'var(--down)' : 'var(--up)') : 'var(--text-primary)' }}>
                            {param.unit === '$/yr' ? `$${val.toLocaleString()}` :
                             param.unit === '%' ? `${val}%` :
                             `$${val.toFixed(val >= 100 ? 0 : val >= 1 ? 2 : 3)}`}
                          </span>
                          {changed && (
                            <span className="text-[10px] font-price" style={{ color: pctChange > 0 ? 'var(--down)' : 'var(--up)' }}>
                              {pctChange > 0 ? '+' : ''}{pctChange.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="relative h-6 flex items-center">
                        <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{
                              width: `${progress}%`,
                              background: changed
                                ? `linear-gradient(90deg, ${meta.color}88, ${meta.color})`
                                : 'rgba(255,255,255,0.15)',
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={val}
                          onChange={e => updateValue(param.id, parseFloat(e.target.value))}
                          className="absolute left-0 right-0 h-6 opacity-0 cursor-pointer"
                          title={param.tooltip}
                        />
                        {/* Thumb indicator */}
                        <div
                          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none transition-all duration-100"
                          style={{
                            left: `calc(${progress}% - 7px)`,
                            background: changed ? meta.color : 'rgba(255,255,255,0.3)',
                            borderColor: changed ? '#fff' : 'rgba(255,255,255,0.2)',
                            boxShadow: changed ? `0 0 8px ${meta.color}44` : 'none',
                          }}
                        />
                        {/* Default marker */}
                        {changed && (
                          <div
                            className="absolute w-0.5 h-3 rounded-full pointer-events-none"
                            style={{
                              left: `${((def - param.min) / (param.max - param.min)) * 100}%`,
                              background: 'rgba(255,255,255,0.2)',
                            }}
                            title={`Baseline: ${def}`}
                          />
                        )}
                      </div>

                      {/* Min/Max labels */}
                      <div className="flex justify-between text-[9px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        <span>{param.unit === '%' ? `${param.min}%` : param.unit === '$/yr' ? `$${param.min.toLocaleString()}` : `$${param.min}`}</span>
                        <span>{param.unit === '%' ? `${param.max}%` : param.unit === '$/yr' ? `$${param.max.toLocaleString()}` : `$${param.max}`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
