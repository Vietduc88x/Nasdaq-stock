'use client';

interface Props {
  data?: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

// Generate a simple random sparkline if no data provided
function generateSparkline(seed: number, points = 24): number[] {
  const data: number[] = [];
  let value = 50 + (seed * 17 % 30);
  for (let i = 0; i < points; i++) {
    value += (Math.sin(seed * 0.3 + i * 0.5) * 3) + (Math.cos(seed * 0.7 + i * 0.3) * 2);
    value = Math.max(10, Math.min(90, value));
    data.push(value);
  }
  return data;
}

export default function Sparkline({ data, width = 100, height = 32, positive = true }: Props) {
  const points = data || generateSparkline(Math.floor(Math.random() * 1000));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const pathData = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const color = positive ? 'var(--up)' : 'var(--down)';
  const glowColor = positive ? 'var(--up-glow-subtle)' : 'var(--down-glow-subtle)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
        style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
      />
    </svg>
  );
}
