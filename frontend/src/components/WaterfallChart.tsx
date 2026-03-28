'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { StageBreakdown } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  stages: StageBreakdown[];
  totalCost: number;
}

export default function WaterfallChart({ stages, totalCost }: Props) {
  // Build waterfall data: each bar starts where the previous one ended
  let cumulative = 0;
  const labels = [...stages.map(s => s.stage.charAt(0).toUpperCase() + s.stage.slice(1)), 'Total'];

  const hidden: number[] = [];
  const visible: number[] = [];

  for (const stage of stages) {
    hidden.push(cumulative);
    visible.push(stage.costPerWp);
    cumulative += stage.costPerWp;
  }
  // Total bar starts from 0
  hidden.push(0);
  visible.push(totalCost);

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Cost Waterfall ($/Wp)
      </h3>
      <div className="h-72">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Hidden',
                data: hidden,
                backgroundColor: 'transparent',
                borderWidth: 0,
                barPercentage: 0.6,
              },
              {
                label: 'Cost',
                data: visible,
                backgroundColor: labels.map((_, i) =>
                  i === labels.length - 1 ? '#ef4444' : colors[i % colors.length]
                ),
                borderWidth: 0,
                barPercentage: 0.6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    if (ctx.datasetIndex === 0) return '';
                    return `$${(ctx.raw as number).toFixed(4)}/Wp`;
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: '#9ca3af' },
              },
              y: {
                stacked: true,
                grid: { color: '#1f2937' },
                ticks: {
                  color: '#9ca3af',
                  callback: (v) => `$${(v as number).toFixed(3)}`,
                },
                min: 0,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
