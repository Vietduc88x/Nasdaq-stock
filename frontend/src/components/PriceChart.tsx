'use client';

import { useEffect, useRef, useState } from 'react';
import type { MaterialHistoryData } from '@/lib/types';

interface Props {
  slug: string;
  yahooSymbol: string | null;
  name: string;
  currentPrice?: number;
  unit?: string;
}

const LIVE_TIMEFRAMES = [
  { label: '5D', range: '5d' },
  { label: '1M', range: '1mo' },
  { label: '3M', range: '3mo' },
  { label: '1Y', range: '1y' },
  { label: 'MAX', range: 'max' },
];

function formatXAxisLabel(date: string, range: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  if (range === '5d') {
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (range === '1mo' || range === '3mo') {
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (range === '1y') {
    return parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getXAxisTicks(dates: string[]) {
  if (dates.length <= 1) return dates.map((date, index) => ({ index, date }));
  const wanted = Math.min(5, dates.length);
  const ticks = Array.from({ length: wanted }, (_, step) => {
    const index = Math.round((step * (dates.length - 1)) / Math.max(wanted - 1, 1));
    return { index, date: dates[index] };
  });

  return ticks.filter((tick, idx, arr) => idx === 0 || tick.index !== arr[idx - 1].index);
}

export default function PriceChart({ slug, yahooSymbol, name, currentPrice, unit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeRange, setActiveRange] = useState(yahooSymbol ? '5d' : 'max');
  const [history, setHistory] = useState<MaterialHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/materials/${slug}/history?range=${activeRange}`);
        if (!res.ok) throw new Error(`History request failed: ${res.status}`);
        const data: MaterialHistoryData = await res.json();
        if (!cancelled) {
          setHistory(data);
        }
      } catch {
        if (!cancelled) {
          setHistory(null);
          setError('Unable to load price history right now');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [slug, activeRange]);

  useEffect(() => {
    if (!canvasRef.current || !history || history.points.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 62, bottom: 34, left: 54 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const data = history.points.map(point => point.value);
    const dates = history.points.map(point => point.date);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || Math.max(max * 0.05, 1);
    const domainMin = Math.max(0, min - range * 0.1);
    const domainMax = max + range * 0.1;
    const domainRange = domainMax - domainMin || 1;

    const first = data[0];
    const last = data[data.length - 1];
    const isPositive = last >= first;
    const lineColor = isPositive ? '#34C759' : '#FF3B30';
    const gradientTop = isPositive ? 'rgba(52,199,89,0.20)' : 'rgba(255,59,48,0.20)';
    const gradientBottom = isPositive ? 'rgba(52,199,89,0)' : 'rgba(255,59,48,0)';

    ctx.clearRect(0, 0, w, h);

    const ySteps = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px SF Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartH * i) / ySteps;
      const val = domainMax - (domainRange * i) / ySteps;
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(`$${val.toFixed(val >= 100 ? 0 : 2)}`, padding.left - 6, y + 3);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
    const getY = (v: number) => padding.top + ((domainMax - v) / domainRange) * chartH;

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(getX(i), getY(data[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, gradientBottom);

    ctx.lineTo(getX(data.length - 1), h - padding.bottom);
    ctx.lineTo(getX(0), h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    const lastY = getY(last);
    ctx.fillStyle = lineColor;
    const labelW = 55;
    const labelH = 18;
    ctx.fillRect(w - padding.right + 2, lastY - labelH / 2, labelW, labelH);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px SF Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${last.toFixed(last >= 100 ? 0 : 2)}`, w - padding.right + 6, lastY + 3);

    const xTicks = getXAxisTicks(dates);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px SF Mono, monospace';
    ctx.textAlign = 'center';

    for (const tick of xTicks) {
      const x = getX(tick.index);
      ctx.beginPath();
      ctx.moveTo(x, h - padding.bottom);
      ctx.lineTo(x, h - padding.bottom + 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();
      ctx.fillText(formatXAxisLabel(tick.date, history.range), x, h - 8);
    }
  }, [history]);

  const values = history?.points?.map(point => point.value) || [];
  const changePct = values.length >= 2
    ? ((values[values.length - 1] - values[0]) / values[0]) * 100
    : null;

  const isSnapshotOnly = history?.sourceKind === 'snapshot' || history?.sourceKind === 'snapshot_fallback';

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          {currentPrice != null && (
            <div className="font-price text-[28px] font-bold" style={{
              color: changePct != null && changePct >= 0 ? 'var(--up)' : changePct != null ? 'var(--down)' : 'var(--text-primary)'
            }}>
              ${currentPrice.toFixed(2)}
            </div>
          )}
          {changePct != null && (
            <span className="text-[13px] font-semibold" style={{ color: changePct >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
              <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-faint)' }}>
                {history?.range?.toUpperCase()}
              </span>
            </span>
          )}
        </div>

        {yahooSymbol ? (
          <div className="segmented-control">
            {LIVE_TIMEFRAMES.map(timeframe => (
              <button
                key={timeframe.range}
                className={`segment ${activeRange === timeframe.range ? 'active' : ''}`}
                onClick={() => setActiveRange(timeframe.range)}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
            Snapshot History
          </span>
        )}
      </div>

      <div className="relative" style={{ height: '208px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--text-faint)' }}>
            Loading history...
          </div>
        )}
        {error && !history && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ color: 'var(--text-faint)' }}>
            {error}
          </div>
        )}
        {!loading && history && history.points.length < 2 && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-center px-6" style={{ color: 'var(--text-faint)' }}>
            {history.note}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: history && history.points.length >= 2 ? 'block' : 'none' }}
        />
      </div>

      {history && (
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span>
            {history.points[0]?.date || 'n/a'} to {history.points[history.points.length - 1]?.date || 'n/a'}
          </span>
          <span style={{ color: isSnapshotOnly ? 'var(--text-faint)' : 'var(--text-secondary)' }}>
            {history.sourceKind === 'yahoo' ? 'Live market history' : history.sourceKind === 'snapshot_fallback' ? 'Snapshot fallback' : history.sourceKind === 'snapshot' ? 'Persisted snapshots' : 'Unavailable'}
          </span>
        </div>
      )}
      {history?.note && (
        <div className="mt-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {history.note}
        </div>
      )}
    </div>
  );
}
