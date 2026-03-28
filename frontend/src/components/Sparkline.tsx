'use client';

interface Props {
  data: number[];     // Required — no fake data generation
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function Sparkline({ data, width = 100, height = 32, positive = true }: Props) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pathData = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
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
