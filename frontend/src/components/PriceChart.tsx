'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  yahooSymbol: string | null;
  name: string;
  currentPrice?: number;
  unit?: string;
  sparkline5d?: number[] | null;
}

const TIMEFRAMES = [
  { label: '5D', range: '5d', interval: '1d' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
  { label: '5Y', range: '5y', interval: '1mo' },
];

export default function PriceChart({ yahooSymbol, name, currentPrice, unit, sparkline5d }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState(0);
  const [chartData, setChartData] = useState<number[] | null>(sparkline5d || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from Yahoo via our API proxy
  useEffect(() => {
    if (!yahooSymbol) {
      setChartData(null);
      setError('No live market data available for this material');
      return;
    }

    const tf = TIMEFRAMES[activeTimeframe];

    // For 5D, use the sparkline data we already have
    if (tf.label === '5D' && sparkline5d && sparkline5d.length > 1) {
      setChartData(sparkline5d);
      setError(null);
      return;
    }

    // Fetch longer timeframes from Yahoo via backend proxy
    setLoading(true);
    setError(null);

    fetch(`/api/materials/${name.toLowerCase().replace(/\s+/g, '-')}/history?range=${tf.range}&interval=${tf.interval}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch history');
        return r.json();
      })
      .then(data => {
        if (data.closes && data.closes.length > 1) {
          setChartData(data.closes);
        } else if (sparkline5d && sparkline5d.length > 1) {
          // Fallback to 5D sparkline if longer range unavailable
          setChartData(sparkline5d);
        } else {
          setError('Historical data not available');
          setChartData(null);
        }
      })
      .catch(() => {
        // Fallback to sparkline5d if available
        if (sparkline5d && sparkline5d.length > 1) {
          setChartData(sparkline5d);
          setError(null);
        } else {
          setError('Could not load price history');
          setChartData(null);
        }
      })
      .finally(() => setLoading(false));
  }, [yahooSymbol, activeTimeframe, name]);

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || !chartData || chartData.length < 2) return;

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
    const padding = { top: 10, right: 60, bottom: 20, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const data = chartData;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const first = data[0];
    const last = data[data.length - 1];
    const isPositive = last >= first;
    const lineColor = isPositive ? '#34C759' : '#FF3B30';
    const gradientTop = isPositive ? 'rgba(52,199,89,0.20)' : 'rgba(255,59,48,0.20)';
    const gradientBottom = isPositive ? 'rgba(52,199,89,0)' : 'rgba(255,59,48,0)';

    ctx.clearRect(0, 0, w, h);

    // Y-axis grid
    const ySteps = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px SF Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartH * i) / ySteps;
      const val = max - (range * i) / ySteps;
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(`$${val.toFixed(val >= 100 ? 0 : 2)}`, w - 5, y + 3);
    }

    // Data line
    const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
    const getY = (v: number) => padding.top + ((max - v) / range) * chartH;

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(getX(i), getY(data[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, gradientBottom);

    ctx.lineTo(getX(data.length - 1), h - padding.bottom);
    ctx.lineTo(getX(0), h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current price label
    const lastY = getY(last);
    ctx.fillStyle = lineColor;
    const labelW = 55;
    const labelH = 18;
    ctx.fillRect(w - padding.right + 2, lastY - labelH / 2, labelW, labelH);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px SF Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${last.toFixed(last >= 100 ? 0 : 2)}`, w - padding.right + 6, lastY + 3);

  }, [chartData]);

  const changePct = chartData && chartData.length >= 2
    ? ((chartData[chartData.length - 1] - chartData[0]) / chartData[0]) * 100
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {currentPrice != null && (
            <div className="font-price text-[28px] font-bold" style={{ color: changePct != null && changePct >= 0 ? 'var(--up)' : changePct != null ? 'var(--down)' : 'var(--text-primary)' }}>
              ${currentPrice.toFixed(currentPrice >= 100 ? 2 : 2)}
            </div>
          )}
          {changePct != null && (
            <span className="text-[13px] font-semibold" style={{ color: changePct >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
              <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-faint)' }}>
                {TIMEFRAMES[activeTimeframe].label}
              </span>
            </span>
          )}
        </div>

        {/* Timeframe selector — only for live materials */}
        {yahooSymbol && (
          <div className="segmented-control">
            {TIMEFRAMES.map((tf, i) => (
              <button
                key={tf.label}
                onClick={() => setActiveTimeframe(i)}
                className={`segment ${i === activeTimeframe ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: '240px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--text-faint)' }}>
            Loading...
          </div>
        )}
        {error && !chartData && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ color: 'var(--text-faint)' }}>
            {error}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: chartData ? 'block' : 'none' }}
        />
      </div>
    </div>
  );
}
