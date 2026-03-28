'use client';

import { useRouter, usePathname } from 'next/navigation';

const CHEMISTRIES = [
  { id: 'lfp', label: 'LFP', desc: 'Lithium Iron Phosphate' },
  { id: 'nmc811', label: 'NMC811', desc: 'Nickel Manganese Cobalt' },
];
const YEARS = [2025, 2026, 2028, 2030, 2035];

interface Props {
  currentChemistry: string;
  currentYear: number;
}

export default function BessControls({ currentChemistry, currentYear }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(overrides: Partial<{ chemistry: string; year: number }>) {
    const params = new URLSearchParams({
      chemistry: overrides.chemistry ?? currentChemistry,
      year: String(overrides.year ?? currentYear),
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Chemistry */}
      <div className="segmented-control">
        {CHEMISTRIES.map(c => (
          <button
            key={c.id}
            onClick={() => navigate({ chemistry: c.id })}
            className={`segment ${c.id === currentChemistry ? 'active' : ''}`}
            title={c.desc}
          >
            {c.label}
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
