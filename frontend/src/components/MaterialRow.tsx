'use client';

import Link from 'next/link';
import { formatUsd, systemIcon, resolveTier } from '@/lib/formatters';
import MaterialIcon from './MaterialIcon';
import PriceChange from './PriceChange';
import Sparkline from './Sparkline';
import type { MaterialSummary } from '@/lib/types';

interface Props {
  material: MaterialSummary;
  index: number;
}

export default function MaterialRow({ material: m, index }: Props) {
  // Badge reflects ACTUAL price state, not material capability.
  const priceTier = m.currentPrice?.coverageTier || m.coverageTier;
  const { tierClass, tierLabel } = resolveTier(priceTier);

  const hasChange = m.currentPrice?.change24hPct != null;
  const hasSparkline = m.currentPrice?.sparkline5d && m.currentPrice.sparkline5d.length > 1;

  return (
    <Link href={`/material/${m.slug}`}>
      <div
        className="grid grid-cols-[2.5fr_1fr_0.8fr_0.6fr_100px] gap-4 items-center px-4 py-3 cursor-pointer row-border animate-cascade hover:bg-[#151515] transition-colors"
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

        {/* 24h Change */}
        <div className="text-right">
          {hasChange ? (
            <PriceChange value={m.currentPrice!.change24hPct!} />
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>—</span>
          )}
        </div>

        {/* Source badge */}
        <div className="text-right">
          <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
        </div>

        {/* 5D Sparkline */}
        <div className="flex justify-end">
          {hasSparkline ? (
            <Sparkline
              data={m.currentPrice!.sparkline5d!}
              width={90}
              height={24}
              positive={(m.currentPrice?.change24hPct ?? 0) >= 0}
            />
          ) : (
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>—</span>
          )}
        </div>
      </div>
    </Link>
  );
}
