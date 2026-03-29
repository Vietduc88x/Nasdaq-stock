'use client';

import { useRouter, usePathname } from 'next/navigation';

const TECHS = ['topcon', 'mono'];
const YEARS = [2025, 2030];

interface Props {
  currentTech: string;
  currentYear: number;
}

export default function SolarImportControls({ currentTech, currentYear }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(overrides: { tech?: string; year?: number }) {
    const params = new URLSearchParams({
      tech: overrides.tech ?? currentTech,
      year: String(overrides.year ?? currentYear),
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Route (fixed for v1) */}
      <div className="segmented-control">
        <button className="segment active">CN → VN</button>
      </div>

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
