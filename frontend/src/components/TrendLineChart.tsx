interface Point {
  date: string;
  value: number;
  projected?: boolean;
}

interface Props {
  points: Point[];
  width?: number;
  height?: number;
  stroke?: string;
  unit?: string;
}

function formatYAxisValue(value: number, unit?: string) {
  if (!unit) return String(Math.round(value));
  const digits = unit === '$/kW' ? 0 : unit === '$/kWh' ? 0 : 3;
  return `${value.toFixed(digits)} ${unit}`;
}

function getXTicks(points: Point[], coords: Array<{ x: number }>) {
  const wanted = Math.min(4, points.length);
  const ticks = Array.from({ length: wanted }, (_, step) => {
    const index = Math.round((step * (points.length - 1)) / Math.max(wanted - 1, 1));
    return { label: points[index].date, x: coords[index]?.x ?? 0 };
  });

  return ticks.filter((tick, index, arr) => index === 0 || tick.label !== arr[index - 1].label);
}

export default function TrendLineChart({
  points,
  width = 220,
  height = 118,
  stroke = 'var(--accent-green)',
  unit,
}: Props) {
  if (!points.length) return null;

  const values = points.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(max * 0.05, 1);
  const domainMin = Math.max(0, min - range * 0.1);
  const domainMax = max + range * 0.1;
  const domainRange = domainMax - domainMin || 1;
  const padding = { top: 8, right: 10, bottom: 22, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const coords = points
    .map((point, index) => {
      const x = padding.left + (innerWidth * index) / Math.max(points.length - 1, 1);
      const y = padding.top + innerHeight - ((point.value - domainMin) / domainRange) * innerHeight;
      return { x, y, projected: point.projected };
    });

  const firstProjectedIndex = coords.findIndex(point => point.projected);
  const solidCoords = firstProjectedIndex === -1
    ? coords
    : coords.slice(0, Math.max(firstProjectedIndex, 1));
  const dashedCoords = firstProjectedIndex <= 0
    ? []
    : coords.slice(firstProjectedIndex - 1);

  const toPolyline = (series: typeof coords) => series.map(point => `${point.x},${point.y}`).join(' ');
  const yTicks = 3;
  const xTicks = getXTicks(points, coords);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {Array.from({ length: yTicks + 1 }).map((_, index) => {
        const y = padding.top + (innerHeight * index) / yTicks;
        const value = domainMax - (domainRange * index) / yTicks;
        return (
          <g key={`y-${index}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 4"
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="var(--text-faint)"
            >
              {formatYAxisValue(value, unit)}
            </text>
          </g>
        );
      })}

      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="rgba(255,255,255,0.08)"
      />
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="rgba(255,255,255,0.08)"
      />

      {solidCoords.length > 1 && (
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={toPolyline(solidCoords)}
        />
      )}
      {dashedCoords.length > 1 && (
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="5 4"
          opacity="0.9"
          points={toPolyline(dashedCoords)}
        />
      )}

      {coords.map((point, index) => (
        <circle
          key={`point-${points[index].date}`}
          cx={point.x}
          cy={point.y}
          r={2.5}
          fill={point.projected ? stroke : '#0b1220'}
          stroke={stroke}
          strokeWidth="1.25"
        />
      ))}

      {xTicks.map(tick => (
        <g key={`x-${tick.label}`}>
          <line
            x1={tick.x}
            y1={height - padding.bottom}
            x2={tick.x}
            y2={height - padding.bottom + 4}
            stroke="rgba(255,255,255,0.08)"
          />
          <text
            x={tick.x}
            y={height - 6}
            textAnchor="middle"
            fontSize="8"
            fill="var(--text-faint)"
          >
            {tick.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
