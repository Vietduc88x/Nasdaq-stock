'use client';

import { useRouter, usePathname } from 'next/navigation';

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

interface Props {
  currentYear: number;
}

export default function WindControls({ currentYear }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(overrides: { year?: number }) {
    const params = new URLSearchParams({
      year: String(overrides.year ?? currentYear),
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Turbine Type (only onshore for v1) */}
      <div className="segmented-control">
        <button className="segment active">ONSHORE</button>
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
