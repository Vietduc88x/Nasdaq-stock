'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { PolicyRegime } from '@/lib/types';

const ROUTE_PRESETS = [
  { from: 'CN', to: 'VN', label: 'CN→VN' },
  { from: 'CN', to: 'US', label: 'CN→US' },
  { from: 'VN', to: 'US', label: 'VN→US' },
  { from: 'CN', to: 'IN', label: 'CN→IN' },
];

interface Props {
  regimes: PolicyRegime[];
  currentRegime: string;
  currentFrom?: string;
  currentTo?: string;
  showRoutePresets?: boolean;
  routeParamNames?: { from: string; to: string };
}

export default function PolicyRegimeControls({
  regimes,
  currentRegime,
  currentFrom,
  currentTo,
  showRoutePresets = true,
  routeParamNames = { from: 'from', to: 'to' },
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeRoute = currentFrom && currentTo ? `${currentFrom}→${currentTo}` : '';

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Route presets */}
      {showRoutePresets && (
        <div className="segmented-control">
          {ROUTE_PRESETS.map(p => (
            <button
              key={p.label}
              className={`segment ${activeRoute === `${p.from}→${p.to}` ? 'active' : ''}`}
              onClick={() => navigate({ [routeParamNames.from]: p.from, [routeParamNames.to]: p.to })}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Regime toggle */}
      <div className="segmented-control">
        {regimes.map(r => (
          <button
            key={r.id}
            className={`segment ${r.id === currentRegime ? 'active' : ''}`}
            onClick={() => navigate({ regime: r.id })}
            title={r.description}
          >
            {r.label.length > 20 ? r.id.replace(/_/g, ' ') : r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
