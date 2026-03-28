'use client';

import { useState } from 'react';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'solar', label: '\u2600\uFE0F Solar' },
  { id: 'bess', label: '\uD83D\uDD0B BESS' },
  { id: 'wind', label: '\uD83D\uDCA8 Wind' },
];

export default function MaterialFilters() {
  const [active, setActive] = useState('all');

  return (
    <div className="segmented-control">
      {FILTERS.map(f => (
        <button
          key={f.id}
          className={`segment ${active === f.id ? 'active' : ''}`}
          onClick={() => setActive(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
