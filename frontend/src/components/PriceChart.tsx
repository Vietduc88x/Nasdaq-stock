'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  symbol: string | null; // Yahoo symbol like "SI=F" or null for reference materials
  name: string;
  currentPrice?: number;
  unit?: string;
}

const TIMEFRAMES = [
  { label: '1D', range: '1d', interval: '5m' },
  { label: '1W', range: '5d', interval: '15m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
  { label: 'ALL', range: '5y', interval: '1mo' },
];

export default function PriceChart({ symbol, name, currentPrice, unit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState(4); // ALL by default
  const [chartData, setChartData] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number; change: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate simulated historical data based on current price
    const basePrice = currentPrice || 50;
    const tf = TIMEFRAMES[activeTimeframe];
    const points = tf.label === '1D' ? 78 : tf.label === '1W' ? 100 : tf.label === '1M' ? 30 : tf.label === '1Y' ? 52 : 60;

    const data: number[] = [];
    let price = basePrice * (0.5 + Math.random() * 0.3); // Start lower for uptrend
    const volatility = tf.label === '1D' ? 0.005 : tf.label === '1W' ? 0.01 : 0.03;
    const trend = (basePrice - price) / points; // Trend toward current price

    for (let i = 0; i < points; i++) {
      price += trend + (Math.random() - 0.45) * basePrice * volatility;
      price = Math.max(price, basePrice * 0.1);
      data.push(price);
    }
    // Last point = current price
    data[data.length - 1] = basePrice;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const startPrice = data[0];
    const change = ((basePrice - startPrice) / startPrice) * 100;

    setChartData(data);
    setPriceRange({ min, max, change });

    // Draw on canvas
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
    const padding = { top: 10, right: 60, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const range = max - min || 1;

    const isPositive = change >= 0;
    const lineColor = isPositive ? '#34C759' : '#FF3B30';
    const gradientTop = isPositive ? 'rgba(52,199,89,0.25)' : 'rgba(255,59,48,0.25)';
    const gradientBottom = isPositive ? 'rgba(52,199,89,0)' : 'rgba(255,59,48,0)';

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Y-axis grid lines + labels
    const ySteps = 5;
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
    const lastY = getY(data[data.length - 1]);
    ctx.fillStyle = lineColor;
    ctx.fillRect(w - padding.right + 2, lastY - 9, 55, 18);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px SF Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${basePrice.toFixed(basePrice >= 100 ? 0 : 2)}`, w - padding.right + 6, lastY + 3);

  }, [activeTimeframe, currentPrice]);

  return (
    <div>
      {/* Header: price + timeframe selector */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {currentPrice && (
            <>
              <div className="font-price text-[28px] font-bold" style={{ color: priceRange && priceRange.change >= 0 ? 'var(--up)' : 'var(--down)' }}>
                ${currentPrice.toFixed(currentPrice >= 100 ? 2 : 2)}
              </div>
              {priceRange && (
                <span className="text-[13px] font-semibold" style={{ color: priceRange.change >= 0 ? 'var(--up)' : 'var(--down)' }}>
                  {priceRange.change >= 0 ? '+' : ''}{priceRange.change.toFixed(2)}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Timeframe buttons */}
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
      </div>

      {/* Chart canvas */}
      <div className="relative" style={{ height: '280px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
