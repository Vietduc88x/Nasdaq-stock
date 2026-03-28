'use client';

import { useRouter, usePathname } from 'next/navigation';

const COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
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
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Tech */}
      <div className="segmented-control">
        {TECHS.map(t => (
          <button
            key={t}
            onClick={() => navigate({ tech: t })}
            className={`segment ${t === currentTech ? 'active' : ''}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Country */}
      <div className="segmented-control">
        {COUNTRIES.map(c => (
          <button
            key={c}
            onClick={() => navigate({ country: c })}
            className={`segment ${c === currentCountry ? 'active' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Year */}
      <div className="segmented-control">
        {YEARS.map(y => (
          <button
            key={y}
            onClick={() => navigate({ year: y })}
            className={`segment ${y === currentYear ? 'active' : ''}`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
