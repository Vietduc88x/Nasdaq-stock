'use client';

import Link from 'next/link';
import { formatUsd, systemIcon } from '@/lib/formatters';
import MaterialIcon from './MaterialIcon';
import type { MaterialSummary } from '@/lib/types';

interface Props {
  material: MaterialSummary;
  index: number;
}

export default function MaterialRow({ material: m, index }: Props) {
  const tierClass = m.coverageTier === 'live_exchange' ? 'tier-live'
    : m.coverageTier === 'delayed_vendor' ? 'tier-vendor'
    : m.coverageTier === 'indexed_reference' ? 'tier-indexed'
    : 'tier-reference';

  const tierLabel = m.coverageTier === 'live_exchange' ? 'Live'
    : m.coverageTier === 'delayed_vendor' ? 'Vendor'
    : m.coverageTier === 'indexed_reference' ? 'Indexed'
    : 'Ref';

  return (
    <Link href={`/material/${m.slug}`}>
      <div
        className="grid grid-cols-[2.5fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3 cursor-pointer row-border animate-cascade hover:bg-[#151515] transition-colors"
        style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
      >
        {/* Name + systems */}
        <div className="flex items-center gap-3">
          <MaterialIcon slug={m.slug} symbol={m.icon} size={32} />
          <div>
            <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
            <div className="flex gap-1 mt-0.5">
              {m.systems.map(s => (
                <span key={s} className="system-pill">{systemIcon(s)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right font-price text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
          <div className="text-[10px] font-normal font-sans" style={{ color: 'var(--text-faint)' }}>
            {m.currentPrice?.unit || ''}
          </div>
        </div>

        {/* Source badge */}
        <div className="text-right">
          <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
        </div>

        {/* Systems used in */}
        <div className="text-right text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {m.systems.length > 0 ? `${m.systems.length} system${m.systems.length > 1 ? 's' : ''}` : '—'}
        </div>
      </div>
    </Link>
  );
}
