interface Point {
  date: string;
  value: number;
}

interface Props {
  points: Point[];
  width?: number;
  height?: number;
  stroke?: string;
}

export default function TrendLineChart({
  points,
  width = 220,
  height = 72,
  stroke = 'var(--accent-green)',
}: Props) {
  if (!points.length) return null;

  const values = points.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 6;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const line = points
    .map((point, index) => {
      const x = padding + (innerWidth * index) / Math.max(points.length - 1, 1);
      const y = padding + innerHeight - ((point.value - min) / range) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
      />
    </svg>
  );
}
