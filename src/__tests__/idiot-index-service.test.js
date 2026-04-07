import { describe, expect, it } from 'vitest';
import { buildSystemIdiotIndex, buildTradeUpliftIndex } from '../services/idiot-index-service.js';

describe('idiot-index-service', () => {
  it('builds a system idiot index from material contributions', () => {
    const index = buildSystemIdiotIndex({
      totalCost: 0.179,
      unit: '$/Wp',
      materials: [
        { name: 'Silver', component: 'Paste', baselineContributionPerWp: 0.0085 },
        { name: 'Glass', component: 'Front cover', baselineContributionPerWp: 0.0120 },
        { name: 'Aluminum', component: 'Frame', baselineContributionPerWp: 0.0095 },
      ],
      baselineKey: 'baselineContributionPerWp',
    });

    expect(index.multiplier).toBeGreaterThan(5);
    expect(index.rawMaterialCost).toBe(0.03);
    expect(index.finishedCost).toBe(0.179);
    expect(index.conversionCost).toBe(0.149);
    expect(index.topDriver?.label).toBe('Glass');
    expect(index.contributors?.[0]?.label).toBe('Glass');
  });

  it('builds a trade uplift index from EXW to DDP', () => {
    const index = buildTradeUpliftIndex({
      breakdown: {
        exw: 0.179,
        inlandFreight: 0.002,
        portHandling: 0.001,
        oceanFreight: 0.004,
        insurance: 0.001,
        customsDuty: 0.07,
        antiDumping: 0.02,
        countervailing: 0,
        customsClearance: 0.001,
        inlandDelivery: 0.003,
        ddp: 0.28,
      },
    });

    expect(index.title).toBe('Trade Uplift Index');
    expect(index.multiplier).toBeGreaterThan(1.5);
    expect(index.topDriver?.label).toBe('Customs Duty');
    expect(index.conversionCost).toBe(0.101);
    expect(index.contributors?.[0]?.label).toBe('Customs Duty');
  });

  it('returns null for trade uplift without a selected route', () => {
    expect(buildTradeUpliftIndex(null)).toBeNull();
  });
});
