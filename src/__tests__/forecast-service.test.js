import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLagModelForMaterial,
  computeNowcast,
  computeLeadIndicator,
  computeConfidence,
  pickTopDrivers,
} from '../services/forecast-service.js';

// --- Unit tests for pure functions (no network) ---

describe('getLagModelForMaterial', () => {
  it('returns config for known material (silver)', () => {
    const lag = getLagModelForMaterial('silver');
    expect(lag.passThrough).toBe(0.80);
    expect(lag.lagDaysMin).toBe(14);
    expect(lag.lagDaysMax).toBe(30);
    expect(lag.priority).toBe(1);
  });

  it('returns config for all solar materials', () => {
    const slugs = ['silver', 'copper', 'aluminum', 'silicon', 'tin', 'steel', 'glass', 'eva'];
    for (const slug of slugs) {
      const lag = getLagModelForMaterial(slug);
      expect(lag.passThrough).toBeGreaterThan(0);
      expect(lag.passThrough).toBeLessThanOrEqual(1);
      expect(lag.lagDaysMin).toBeGreaterThan(0);
      expect(lag.lagDaysMax).toBeGreaterThan(lag.lagDaysMin);
    }
  });

  it('returns conservative defaults for unknown material', () => {
    const lag = getLagModelForMaterial('unobtanium');
    expect(lag.passThrough).toBe(0.50);
    expect(lag.lagDaysMin).toBe(30);
    expect(lag.lagDaysMax).toBe(90);
    expect(lag.priority).toBe(99);
  });
});

describe('computeNowcast', () => {
  it('returns modeled cost when no live signals', () => {
    const signals = [
      { dataQuality: 'reference', changePct: null, signalContribution: 0 },
      { dataQuality: 'reference', changePct: null, signalContribution: 0 },
    ];
    const result = computeNowcast(0.1800, [], signals);
    expect(result).toBe(0.1800);
  });

  it('adjusts upward when material prices are rising', () => {
    const signals = [
      { dataQuality: 'live', changePct: 10.0, signalContribution: 0.001 },
      { dataQuality: 'live', changePct: 5.0, signalContribution: 0.0005 },
    ];
    const result = computeNowcast(0.1800, [], signals);
    expect(result).toBeGreaterThan(0.1800);
  });

  it('adjusts downward when material prices are falling', () => {
    const signals = [
      { dataQuality: 'live', changePct: -8.0, signalContribution: -0.0012 },
    ];
    const result = computeNowcast(0.1800, [], signals);
    expect(result).toBeLessThan(0.1800);
  });

  it('ignores reference-quality signals', () => {
    const signals = [
      { dataQuality: 'reference', changePct: 50.0, signalContribution: 0.01 },
    ];
    const result = computeNowcast(0.1800, [], signals);
    expect(result).toBe(0.1800);
  });
});

describe('computeLeadIndicator', () => {
  it('returns Stable when no live signals', () => {
    const signals = [
      { changePct: null, dataQuality: 'reference', baselineContribution: 0.01, passThrough: 0.8, signalContribution: 0, lagDaysMin: 14, lagDaysMax: 30 },
    ];
    const result = computeLeadIndicator(signals);
    expect(result.label).toBe('Stable');
    expect(result.score).toBe(0);
  });

  it('returns Rising when dominant drivers are positive', () => {
    const signals = [
      { changePct: 8.0, dataQuality: 'live', baselineContribution: 0.012, passThrough: 0.7, signalContribution: 0.001, lagDaysMin: 30, lagDaysMax: 60 },
      { changePct: 5.0, dataQuality: 'live', baselineContribution: 0.0085, passThrough: 0.8, signalContribution: 0.0005, lagDaysMin: 14, lagDaysMax: 30 },
    ];
    const result = computeLeadIndicator(signals);
    expect(result.score).toBeGreaterThan(2);
    expect(['Rising', 'Strongly Rising']).toContain(result.label);
  });

  it('returns Falling when dominant drivers are negative', () => {
    const signals = [
      { changePct: -10.0, dataQuality: 'live', baselineContribution: 0.012, passThrough: 0.7, signalContribution: -0.001, lagDaysMin: 30, lagDaysMax: 60 },
      { changePct: -6.0, dataQuality: 'live', baselineContribution: 0.008, passThrough: 0.8, signalContribution: -0.0005, lagDaysMin: 14, lagDaysMax: 30 },
    ];
    const result = computeLeadIndicator(signals);
    expect(result.score).toBeLessThan(-2);
    expect(result.label).toBe('Falling');
  });

  it('has expectedLag string', () => {
    const signals = [
      { changePct: 3.0, dataQuality: 'live', baselineContribution: 0.01, passThrough: 0.7, signalContribution: 0.001, lagDaysMin: 14, lagDaysMax: 30 },
    ];
    const result = computeLeadIndicator(signals);
    expect(result.expectedLag).toMatch(/\d+-\d+ weeks/);
  });
});

describe('computeConfidence', () => {
  it('returns Low for empty signals', () => {
    expect(computeConfidence([])).toBe('Low');
  });

  it('returns High when most materials are live', () => {
    const signals = [
      { dataQuality: 'live', baselineContribution: 0.012 },
      { dataQuality: 'live', baselineContribution: 0.0085 },
      { dataQuality: 'live', baselineContribution: 0.0095 },
      { dataQuality: 'live', baselineContribution: 0.0012 },
      { dataQuality: 'reference', baselineContribution: 0.006 },
    ];
    const result = computeConfidence(signals);
    expect(result).toBe('High');
  });

  it('returns Low when all materials are reference', () => {
    const signals = [
      { dataQuality: 'reference', baselineContribution: 0.012 },
      { dataQuality: 'reference', baselineContribution: 0.008 },
      { dataQuality: 'reference', baselineContribution: 0.006 },
    ];
    const result = computeConfidence(signals);
    expect(result).toBe('Low');
  });

  it('returns Medium for mixed coverage', () => {
    // 1 live (small cost), 3 reference (big cost) → combined < 0.5 but > 0.25
    const signals = [
      { dataQuality: 'live', baselineContribution: 0.008 },
      { dataQuality: 'reference', baselineContribution: 0.012 },
      { dataQuality: 'reference', baselineContribution: 0.006 },
      { dataQuality: 'reference', baselineContribution: 0.003 },
    ];
    const result = computeConfidence(signals);
    expect(result).toBe('Medium');
  });
});

describe('pickTopDrivers', () => {
  const signals = [
    { material: 'silver', signalContribution: 0.0003, changePct: 2.0, weightPct: 4.7, passThrough: 0.8, lagLabel: '2-4 weeks' },
    { material: 'aluminum', signalContribution: 0.0010, changePct: 5.0, weightPct: 5.3, passThrough: 0.7, lagLabel: '4-9 weeks' },
    { material: 'copper', signalContribution: -0.0001, changePct: -1.0, weightPct: 0.7, passThrough: 0.75, lagLabel: '2-6 weeks' },
    { material: 'glass', signalContribution: 0.0005, changePct: 3.0, weightPct: 6.7, passThrough: 0.6, lagLabel: '4-13 weeks' },
    { material: 'tin', signalContribution: 0.0000, changePct: 0.1, weightPct: 0.2, passThrough: 0.7, lagLabel: '2-4 weeks' },
  ];

  it('returns top 3 by absolute signal contribution', () => {
    const top = pickTopDrivers(signals, 3);
    expect(top).toHaveLength(3);
    expect(top[0].material).toBe('aluminum');
    expect(top[1].material).toBe('glass');
    expect(top[2].material).toBe('silver');
  });

  it('returns correct shape', () => {
    const top = pickTopDrivers(signals, 1);
    expect(top[0]).toHaveProperty('material');
    expect(top[0]).toHaveProperty('changePct');
    expect(top[0]).toHaveProperty('weightPct');
    expect(top[0]).toHaveProperty('passThrough');
    expect(top[0]).toHaveProperty('lagLabel');
    expect(top[0]).toHaveProperty('signalContribution');
  });

  it('respects limit parameter', () => {
    expect(pickTopDrivers(signals, 2)).toHaveLength(2);
    expect(pickTopDrivers(signals, 5)).toHaveLength(5);
  });

  it('sorted descending by absolute contribution', () => {
    const top = pickTopDrivers(signals, 5);
    for (let i = 1; i < top.length; i++) {
      expect(Math.abs(top[i - 1].signalContribution)).toBeGreaterThanOrEqual(
        Math.abs(top[i].signalContribution)
      );
    }
  });
});

// --- Integration test: calculateSolarForecast (hits live services but no external APIs) ---

describe('calculateSolarForecast (integration)', () => {
  // Dynamic import to avoid top-level async issues with mocked modules
  let calculateSolarForecast;

  beforeEach(async () => {
    const mod = await import('../services/forecast-service.js');
    calculateSolarForecast = mod.calculateSolarForecast;
  });

  it('returns valid forecast object for VN/topcon/2025', async () => {
    const forecast = await calculateSolarForecast('VN', 'topcon', 2025);

    expect(forecast.currentModeledCost).toBeGreaterThan(0.15);
    expect(forecast.currentModeledCost).toBeLessThan(0.25);
    expect(forecast.nowcastCost).toBeGreaterThan(0);
    expect(forecast.forward30dCost).toBeGreaterThan(0);
    expect(Number.isFinite(forecast.nowcastCost)).toBe(true);
    expect(Number.isFinite(forecast.forward30dCost)).toBe(true);

    expect(forecast.leadIndicator).toHaveProperty('label');
    expect(forecast.leadIndicator).toHaveProperty('score');
    expect(forecast.leadIndicator).toHaveProperty('confidence');
    expect(forecast.leadIndicator).toHaveProperty('expectedLag');
    expect(['Falling', 'Stable', 'Rising', 'Strongly Rising']).toContain(forecast.leadIndicator.label);
    expect(['High', 'Medium', 'Low']).toContain(forecast.leadIndicator.confidence);

    expect(forecast.topDrivers).toBeInstanceOf(Array);
    expect(forecast.topDrivers.length).toBeLessThanOrEqual(3);
  });

  it('nowcast stays close to modeled cost (within 10%)', async () => {
    const forecast = await calculateSolarForecast('VN', 'topcon', 2025);
    const deviation = Math.abs(forecast.nowcastCost - forecast.currentModeledCost) / forecast.currentModeledCost;
    expect(deviation).toBeLessThan(0.10);
  });

  it('works for all 6 countries', async () => {
    const countries = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    for (const country of countries) {
      const forecast = await calculateSolarForecast(country, 'topcon', 2025);
      expect(forecast.currentModeledCost).toBeGreaterThan(0);
      expect(forecast.topDrivers).toBeInstanceOf(Array);
    }
  });
});
