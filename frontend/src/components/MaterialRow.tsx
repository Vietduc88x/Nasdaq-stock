'use client';

import Link from 'next/link';
import { formatUsd, systemIcon } from '@/lib/formatters';
import MaterialIcon from './MaterialIcon';
import Sparkline from './Sparkline';
import PriceChange from './PriceChange';
import type { MaterialSummary } from '@/lib/types';

interface Props {
  material: MaterialSummary;
  index: number;
}

export default function MaterialRow({ material: m, index }: Props) {
  const change = Math.sin(index * 2.1) * 8;

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
        className="grid grid-cols-[2.5fr_1fr_1fr_1fr_120px] gap-4 items-center px-4 py-3 cursor-pointer row-border animate-cascade hover:bg-[#151515] transition-colors"
        style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
      >
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

        <div className="text-right font-price text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {m.currentPrice ? formatUsd(m.currentPrice.value) : '—'}
          <div className="text-[10px] font-normal font-sans" style={{ color: 'var(--text-faint)' }}>
            {m.currentPrice?.unit || ''}
          </div>
        </div>

        <div className="text-right">
          <PriceChange value={change} />
        </div>

        <div className="text-right">
          <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
        </div>

        <div className="flex justify-end">
          <Sparkline width={100} height={28} positive={change >= 0} />
        </div>
      </div>
    </Link>
  );
}
