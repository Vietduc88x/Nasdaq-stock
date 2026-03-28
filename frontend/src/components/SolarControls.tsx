'use client';

import { useRouter, usePathname } from 'next/navigation';

const COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
const COUNTRY_LABELS: Record<string, string> = {
  CN: 'China', VN: 'Vietnam', IN: 'India', DE: 'Germany', US: 'USA', AU: 'Australia',
};
const TECHS = ['topcon', 'mono'];
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

interface Props {
  currentCountry: string;
  currentTech: string;
  currentYear: number;
}

export default function SolarControls({ currentCountry, currentTech, currentYear }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(overrides: Partial<{ country: string; tech: string; year: number }>) {
    const params = new URLSearchParams({
      country: overrides.country ?? currentCountry,
      tech: overrides.tech ?? currentTech,
      year: String(overrides.year ?? currentYear),
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="card p-4 space-y-4">
      {/* Technology */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-medium w-20">Tech</span>
        <div className="flex gap-2">
          {TECHS.map(t => (
            <button
              key={t}
              onClick={() => navigate({ tech: t })}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                t === currentTech
                  ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-medium w-20">Country</span>
        <div className="flex gap-2 flex-wrap">
          {COUNTRIES.map(c => (
            <button
              key={c}
              onClick={() => navigate({ country: c })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                c === currentCountry
                  ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
              title={COUNTRY_LABELS[c]}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-medium w-20">Year</span>
        <div className="flex gap-2 flex-wrap">
          {YEARS.map(y => (
            <button
              key={y}
              onClick={() => navigate({ year: y })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                y === currentYear
                  ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
