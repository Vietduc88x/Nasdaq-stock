'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface Route {
  from: string;
  to: string;
  label: string;
}

interface Props {
  routes: Route[];
  currentFrom?: string;
  currentTo?: string;
  currentExw: number;
}

export default function LandedCostControls({ routes, currentFrom, currentTo, currentExw }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [exwInput, setExwInput] = useState(String(currentExw));

  function navigate(overrides: { from?: string; to?: string; exw?: number }) {
    const params = new URLSearchParams();
    const from = overrides.from ?? currentFrom;
    const to = overrides.to ?? currentTo;
    const exw = overrides.exw ?? currentExw;
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('exw', String(exw));
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleExwSubmit() {
    const val = parseFloat(exwInput);
    if (!isNaN(val) && val > 0 && val <= 5) {
      navigate({ exw: val });
    }
  }

  const selectedRoute = currentFrom && currentTo
    ? `${currentFrom}→${currentTo}`
    : '';

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      {/* Route selector */}
      <div className="segmented-control flex-wrap">
        <button
          className={`segment ${!selectedRoute ? 'active' : ''}`}
          onClick={() => {
            const params = new URLSearchParams({ exw: String(currentExw) });
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          All Routes
        </button>
        {routes.map(r => {
          const key = `${r.from}→${r.to}`;
          return (
            <button
              key={key}
              className={`segment ${selectedRoute === key ? 'active' : ''}`}
              onClick={() => navigate({ from: r.from, to: r.to })}
            >
              {r.from}→{r.to}
            </button>
          );
        })}
      </div>

      {/* EXW input */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>EXW</label>
        <div className="flex items-center gap-1">
          <span className="text-[13px]" style={{ color: 'var(--text-faint)' }}>$</span>
          <input
            type="number"
            step="0.001"
            min="0.01"
            max="5"
            value={exwInput}
            onChange={e => setExwInput(e.target.value)}
            onBlur={handleExwSubmit}
            onKeyDown={e => e.key === 'Enter' && handleExwSubmit()}
            className="w-20 px-2 py-1.5 rounded-md text-[13px] font-price font-medium text-right"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>/Wp</span>
        </div>
      </div>
    </div>
  );
}
