'use client';

interface Props {
  value: number; // percentage
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceChange({ value, size = 'sm' }: Props) {
  const abs = Math.abs(value);
  const isUp = value >= 0;

  // 3-tier intensity
  const intensity = abs >= 10 ? 'mega' : abs >= 5 ? 'big' : '';

  const color = isUp ? 'var(--up)' : 'var(--down)';
  const brightColor = isUp ? 'var(--up-bright)' : 'var(--down-bright)';
  const glowColor = isUp ? 'var(--up-glow)' : 'var(--down-glow)';

  const fontSize = size === 'lg' ? '15px' : size === 'md' ? '13px' : '12px';
  const fontWeight = intensity ? 700 : 600;

  const triangleSize = size === 'lg' ? 8 : 6;
  const triangleStyle: React.CSSProperties = intensity === 'mega'
    ? { filter: `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 10px ${glowColor})` }
    : intensity === 'big'
    ? { filter: `drop-shadow(0 0 4px ${glowColor})` }
    : {};

  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        color: intensity ? brightColor : color,
        fontSize,
        fontWeight,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <svg
        width={triangleSize}
        height={triangleSize}
        viewBox="0 0 8 8"
        style={{ ...triangleStyle, transform: isUp ? 'none' : 'rotate(180deg)' }}
      >
        <path d="M4 1L7 6H1L4 1Z" fill="currentColor" />
      </svg>
      {abs.toFixed(1)}%
    </span>
  );
}
