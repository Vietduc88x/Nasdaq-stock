export function formatUsdWp(value: number): string {
  return `$${value.toFixed(4)}/Wp`;
}

export function formatUsd(value: number): string {
  if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(5)}`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function tierBadge(tier: string): { label: string; color: string } {
  switch (tier) {
    case 'live_exchange': return { label: 'Live', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    case 'delayed_vendor': return { label: 'Vendor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'indexed_reference': return { label: 'Indexed', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    case 'modeled_reference': return { label: 'Reference', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    default: return { label: tier, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }
}

export function systemIcon(system: string): string {
  switch (system) {
    case 'solar': return '\u2600\uFE0F';
    case 'bess': return '\uD83D\uDD0B';
    case 'wind': return '\uD83D\uDCA8';
    default: return '\u26A1';
  }
}
