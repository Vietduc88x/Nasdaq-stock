'use client';

const ICON_COLORS: Record<string, string> = {
  silver: '#C0C0C0',
  gold: '#FFD700',
  copper: '#B87333',
  aluminum: '#A8A9AD',
  silicon: '#5B6770',
  tin: '#D3D4D5',
  zinc: '#BAC4C8',
  nickel: '#727472',
  steel: '#71797E',
  glass: '#87CEEB',
  eva: '#E8D5B7',
  lithium: '#4FC3F7',
  cobalt: '#0047AB',
  graphite: '#383838',
  manganese: '#9E7BB5',
  neodymium: '#7B68EE',
  dysprosium: '#9370DB',
  'carbon-fiber': '#2D2D2D',
  fiberglass: '#F5F5DC',
  'iron-phosphate': '#CD853F',
  electrolyte: '#00BCD4',
};

interface Props {
  slug: string;
  symbol: string;
  size?: number;
}

export default function MaterialIcon({ slug, symbol, size = 28 }: Props) {
  const color = ICON_COLORS[slug] || '#888';

  return (
    <div
      className="rounded-full flex items-center justify-center font-mono font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: `1px solid ${color}33`,
        color: color,
        fontSize: size * 0.35,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
