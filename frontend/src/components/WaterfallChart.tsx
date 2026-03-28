'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import type { StageBreakdown } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface Props {
  stages: StageBreakdown[];
  totalCost: number;
  costUnit?: string; // '$/Wp' or '$/kWh'
}

export default function WaterfallChart({ stages, totalCost, costUnit = '$/Wp' }: Props) {
  const isKwh = costUnit === '$/kWh';
  const decimals = isKwh ? 1 : 4;
  const getStageCost = (s: StageBreakdown) => s.costPerWp ?? s.costPerKwh ?? 0;
  let cumulative = 0;
  const labels = [...stages.map(s => {
    const name = s.stage.replace(/([A-Z])/g, ' $1').trim();
    return name.charAt(0).toUpperCase() + name.slice(1);
  }), 'Total'];

  const hidden: number[] = [];
  const visible: number[] = [];

  for (const stage of stages) {
    const cost = getStageCost(stage);
    hidden.push(cumulative);
    visible.push(cost);
    cumulative += cost;
  }
  hidden.push(0);
  visible.push(totalCost);

  const stageColors = ['#34C759', '#3B82F6', '#FBBF24', '#A855F7', '#ec4899', '#06b6d4'];
  const barColors = labels.map((_, i) =>
    i === labels.length - 1 ? 'rgba(255,255,255,0.15)' : stageColors[i % stageColors.length]
  );

  return (
    <div className="card-surface p-4">
      <div className="section-label mb-4">Cost Waterfall</div>
      <div className="h-64 sm:h-72">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Hidden',
                data: hidden,
                backgroundColor: 'transparent',
                borderWidth: 0,
                barPercentage: 0.5,
              },
              {
                label: 'Cost',
                data: visible,
                backgroundColor: barColors,
                borderWidth: 0,
                barPercentage: 0.5,
                borderRadius: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1a1a1a',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleColor: 'rgba(255,255,255,0.7)',
                bodyColor: 'rgba(255,255,255,0.95)',
                bodyFont: { family: 'SF Mono, monospace' },
                padding: 10,
                callbacks: {
                  label: (ctx) => {
                    if (ctx.datasetIndex === 0) return '';
                    return `$${(ctx.raw as number).toFixed(decimals)}${costUnit.replace('$', '')}`;
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 12 } },
                border: { display: false },
              },
              y: {
                stacked: true,
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: {
                  color: 'rgba(255,255,255,0.25)',
                  font: { size: 11, family: 'SF Mono, monospace' },
                  callback: (v) => `$${(v as number).toFixed(isKwh ? 0 : 3)}`,
                },
                border: { display: false },
                min: 0,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
