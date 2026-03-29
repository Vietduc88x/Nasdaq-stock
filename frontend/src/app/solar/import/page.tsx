import { fetchSolarImportPage } from '@/lib/api';
import Link from 'next/link';
import SolarImportControls from '@/components/SolarImportControls';
import SourcingScenarioTable from '@/components/SourcingScenarioTable';
import WaterfallChart from '@/components/WaterfallChart';

export const revalidate = 60;

export default async function SolarImportPage({
  searchParams,
}: {
  searchParams: { tech?: string; year?: string };
}) {
  const tech = searchParams.tech?.toLowerCase() || 'topcon';
  const year = parseInt(searchParams.year || '2025', 10);

  const data = await fetchSolarImportPage('VN', 'CN', tech, year);

  // Find the cheapest import scenario
  const cheapest = data.scenarios.reduce((min, s) =>
    s.totalCostPerWp < min.totalCostPerWp ? s : min
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-2">
        <Link href="/solar" className="inline-flex items-center gap-1 text-[12px] mb-4 group" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Solar PV Cost Model
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight">Solar Import Stage Simulator</h1>
        <p className="text-[13px] mt-1 max-w-2xl" style={{ color: 'var(--text-tertiary)' }}>
          Compare sourcing strategies: full domestic manufacturing vs importing wafers, cells, or finished modules from China to Vietnam.
          Based on IRENA cost model + real tariff/freight data.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg text-[11px] leading-relaxed" style={{
        background: 'rgba(251,191,36,0.06)',
        borderLeft: '3px solid #fbbf24',
        color: 'var(--text-muted)'
      }}>
        Indicative model combining IRENA manufacturing costs with published tariff schedules.
        Not legal or customs advice. Trade adders based on ACFTA preferential rates (CN→VN).
      </div>

      {/* Controls */}
      <SolarImportControls currentTech={tech} currentYear={year} />

      {/* Headline result */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Best strategy: <span className="font-semibold" style={{ color: 'var(--up)' }}>{cheapest.label}</span>
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {cheapest.mainDriver || 'Lower upstream manufacturing cost'}
          </div>
        </div>
        <div className="text-right">
          <div className="font-price text-[28px] font-bold tracking-tight" style={{ color: 'var(--up)' }}>
            ${cheapest.totalCostPerWp.toFixed(3)}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            $/Wp &middot; {cheapest.deltaPct.toFixed(1)}% vs domestic
          </div>
        </div>
      </div>

      {/* Scenario comparison table */}
      <SourcingScenarioTable scenarios={data.scenarios} />

      {/* Waterfall for each scenario */}
      {data.scenarios.filter(s => s.scenario !== 'domestic').map(s => (
        <div key={s.scenario}>
          <div className="section-label mb-2">{s.label} — Stage Breakdown</div>
          <WaterfallChart
            stages={s.stageBreakdown.map(st => ({
              stage: st.stage,
              costPerWp: st.costPerWp,
              components: {},
            }))}
            totalCost={s.totalCostPerWp}
            costUnit="$/Wp"
          />
          {s.tradeAdders && (
            <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: 'var(--text-faint)' }}>
              <span>EXW: ${s.tradeAdders.exportExw.toFixed(4)}</span>
              <span>FOB: ${s.tradeAdders.fob.toFixed(4)}</span>
              <span>CIF: ${s.tradeAdders.cif.toFixed(4)}</span>
              <span>DDP: ${s.tradeAdders.ddp.toFixed(4)}</span>
              <span>Trade adder: <span className="font-price" style={{
                color: s.tradeAdders.tradeAdder > 0.005 ? '#fbbf24' : 'var(--text-muted)'
              }}>${s.tradeAdders.tradeAdder.toFixed(4)}/Wp</span></span>
            </div>
          )}
        </div>
      ))}

      {/* Model provenance */}
      <div className="card-surface p-4">
        <div className="section-label mb-3">Assumptions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <div>
            <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Manufacturing Model</div>
            <div>Source: {data.model.solarModelVersion}</div>
            <div>Destination: Vietnam ({tech.toUpperCase()}, {year})</div>
            <div>Source country: China</div>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Trade Model</div>
            <div>Source: {data.model.tradeModelVersion}</div>
            <div>Route: CN → VN (ACFTA, 0% duty)</div>
            <div>HS Codes: 8541.43 (module), 8541.42 (cell), 8541.49 (wafer)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
