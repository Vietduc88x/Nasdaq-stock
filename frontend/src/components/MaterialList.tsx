'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatUsd, systemIcon } from '@/lib/formatters';
import MaterialRow from './MaterialRow';
import MaterialIcon from './MaterialIcon';
import type { MaterialSummary } from '@/lib/types';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'solar', label: '☀️ Solar' },
  { id: 'bess', label: '🔋 BESS' },
  { id: 'wind', label: '💨 Wind' },
];

interface Props {
  materials: MaterialSummary[];
}

export default function MaterialList({ materials }: Props) {
  const [active, setActive] = useState('all');

  const filtered = active === 'all'
    ? materials
    : materials.filter(m => m.systems.includes(active));

  return (
    <>
      {/* Filters */}
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

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[2.5fr_1fr_0.8fr_0.6fr_100px] gap-4 px-4 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          <span>Material</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h</span>
          <span className="text-right">Source</span>
          <span className="text-right">5D</span>
        </div>

        {filtered.map((m, i) => (
          <MaterialRow key={m.slug} material={m} index={i} />
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-0">
        {filtered.map((m, i) => (
          <Link key={m.slug} href={`/material/${m.slug}`}>
            <div className="flex items-center gap-3 py-3 row-border animate-cascade" style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}>
              <MaterialIcon slug={m.slug} symbol={m.icon} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium">{m.name}</div>
                <div className="flex gap-1 mt-0.5">
                  {m.systems.map(s => (
                    <span key={s} className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{systemIcon(s)} {s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="font-price text-[16px] font-semibold">
                  {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                  {m.currentPrice?.unit || ''}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            No materials in this category.
          </div>
        )}
      </div>
    </>
  );
}
