import { describe, expect, it } from 'vitest';
import { buildBessIdiotIndex, buildSystemIdiotIndex, buildTradeUpliftIndex, buildWindIdiotIndex } from '../services/idiot-index-service.js';
import { calculateBessCost, getBessBaseBasket } from '../services/bess-cost-engine.js';
import { calculateWindCost, getWindBaseBasket } from '../services/wind-cost-engine.js';

describe('idiot-index-service', () => {
  it('builds a system idiot index from material contributions', () => {
    const index = buildSystemIdiotIndex({
      totalCost: 0.179,
      unit: '$/Wp',
      materials: [
        { name: 'Silver', component: 'Paste', baselineContributionPerWp: 0.0085, usagePerUnit: 0.11, usageUnit: 'g/Wp' },
        { name: 'Glass', component: 'Front cover', baselineContributionPerWp: 0.0120, usagePerUnit: 5.6, usageUnit: 'g/Wp' },
        { name: 'Aluminum', component: 'Frame', baselineContributionPerWp: 0.0095, usagePerUnit: 1.5, usageUnit: 'g/Wp' },
      ],
      baselineKey: 'baselineContributionPerWp',
    });

    expect(index.multiplier).toBeGreaterThan(5);
    expect(index.rawMaterialCost).toBe(0.03);
    expect(index.finishedCost).toBe(0.179);
    expect(index.conversionCost).toBe(0.149);
    expect(index.topDriver?.label).toBe('Glass');
    expect(index.contributors?.[0]?.label).toBe('Glass');
    expect(index.contributors?.[0]?.formula).toContain('g/Wp');
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

  it('builds a BESS idiot index from BatPaC stage components', () => {
    const cost = calculateBessCost('lfp', 2025);
    const index = buildBessIdiotIndex({
      totalCost: cost.totalCostPerKwh,
      contributors: getBessBaseBasket('lfp', 2025),
    });

    expect(index.rawMaterialCost).toBeGreaterThan(40);
    expect(index.rawMaterialCost).toBeLessThan(cost.totalCostPerKwh);
    expect(index.multiplier).toBeGreaterThan(1);
    expect(index.multiplier).toBeLessThan(2);
    expect(index.topDriver?.label).toBe('Cathode Active Material (LFP)');
    expect(index.contributors?.some(item => item.label === 'Cathode Active Material (LFP)')).toBe(true);
    expect(index.contributors?.some(item => item.label === 'Formation Cycling')).toBe(false);
    expect(index.contributors?.find(item => item.label === 'Cathode Active Material (LFP)')?.formula).toContain('kg/kWh');
  });

  it('builds a wind idiot index from bottom-up stage components', () => {
    const cost = calculateWindCost('onshore', 2025);
    const index = buildWindIdiotIndex({
      totalCost: cost.totalCostPerKw,
      contributors: getWindBaseBasket(2025),
    });

    expect(index.rawMaterialCost).toBeGreaterThan(1000);
    expect(index.rawMaterialCost).toBeLessThan(cost.totalCostPerKw);
    expect(index.multiplier).toBeGreaterThan(1);
    expect(index.multiplier).toBeLessThan(1.5);
    expect(index.topDriver?.label).toBe('Tower Steel');
    expect(index.contributors?.some(item => item.label === 'Crane Erection')).toBe(false);
    expect(index.contributors?.find(item => item.label === 'Tower Steel')?.formula).toContain('kg/kW');
  });
});
