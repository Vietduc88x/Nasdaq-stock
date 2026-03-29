import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { registerPageDataRoutes } from '../routes/page-data.js';

let app;

beforeAll(async () => {
  app = Fastify({ logger: false });
  registerPageDataRoutes(app);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/page/solar-compare — route-level', () => {
  describe('valid requests', () => {
    it('returns 200 with 3 countries', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,CN,IN&tech=topcon&year=2025',
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.comparison).toHaveLength(3);
      expect(body.cheapestCountry).toBeDefined();
      expect(body.cheapestCost).toBeGreaterThan(0);
      expect(body.params.countries).toEqual(['VN', 'CN', 'IN']);
      expect(body.model.version).toMatch(/^solar-irena/);
    });

    it('response shape matches contract', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,CN&tech=topcon&year=2025',
      });
      const body = res.json();

      // Each comparison entry has the right fields
      body.comparison.forEach(entry => {
        expect(entry).toHaveProperty('country');
        expect(entry).toHaveProperty('totalCostPerWp');
        expect(entry).toHaveProperty('deltaVsCheapest');
        expect(entry).toHaveProperty('deltaPct');
        expect(entry).toHaveProperty('isCheapest');
        expect(entry).toHaveProperty('stageBreakdown');
        expect(entry.stageBreakdown).toHaveLength(4);
      });

      // Exactly one entry is cheapest
      const cheapestEntries = body.comparison.filter(e => e.isCheapest);
      expect(cheapestEntries).toHaveLength(1);
      expect(cheapestEntries[0].deltaVsCheapest).toBe(0);
      expect(cheapestEntries[0].deltaPct).toBe(0);
    });

    it('deltaPct is correct relative to cheapest', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=CN,DE&tech=topcon&year=2025',
      });
      const body = res.json();
      const cn = body.comparison.find(c => c.country === 'CN');
      const de = body.comparison.find(c => c.country === 'DE');

      expect(cn.isCheapest).toBe(true);
      expect(de.deltaVsCheapest).toBeGreaterThan(0);
      const expectedPct = Math.round(((de.totalCostPerWp - cn.totalCostPerWp) / cn.totalCostPerWp) * 1000) / 10;
      expect(de.deltaPct).toBe(expectedPct);
    });

    it('returns all 6 countries', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=CN,VN,IN,DE,US,AU',
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().comparison).toHaveLength(6);
    });

    it('uses defaults when no params provided', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare',
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.params.countries).toEqual(['VN', 'CN', 'IN']);
      expect(body.params.tech).toBe('topcon');
      expect(body.params.year).toBe(2025);
    });
  });

  describe('validation — invalid requests', () => {
    it('rejects invalid country code', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,XX',
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toMatch(/valid countries/i);
    });

    it('rejects fewer than 2 countries', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN',
      });
      expect(res.statusCode).toBe(400);
    });

    it('rejects invalid tech', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,CN&tech=perovskite',
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toMatch(/tech/i);
    });

    it('rejects year out of range', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,CN&year=2040',
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('duplicate country dedup', () => {
    it('deduplicates countries — VN,VN,CN becomes VN,CN and is rejected (< 2 unique? no, 2 unique)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,VN,CN',
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      // Should be deduped to 2 countries, not 3
      expect(body.comparison).toHaveLength(2);
      expect(body.params.countries).toEqual(['VN', 'CN']);
    });

    it('all-same country dedupes to 1 and is rejected', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/page/solar-compare?countries=VN,VN,VN',
      });
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/page/solar — forecast integration', () => {
  it('includes forecast object in solar page response', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/solar?country=VN&tech=topcon&year=2025',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();

    expect(body).toHaveProperty('forecast');
    expect(body.forecast).not.toBeNull();
  });

  it('forecast has correct shape', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/solar?country=VN&tech=topcon&year=2025',
    });
    const { forecast } = res.json();

    expect(forecast.currentModeledCost).toBeGreaterThan(0);
    expect(forecast.nowcastCost).toBeGreaterThan(0);
    expect(forecast.forward30dCost).toBeGreaterThan(0);

    expect(forecast.leadIndicator).toHaveProperty('label');
    expect(forecast.leadIndicator).toHaveProperty('score');
    expect(forecast.leadIndicator).toHaveProperty('confidence');
    expect(forecast.leadIndicator).toHaveProperty('expectedLag');
    expect(['Falling', 'Stable', 'Rising', 'Strongly Rising']).toContain(forecast.leadIndicator.label);
    expect(['High', 'Medium', 'Low']).toContain(forecast.leadIndicator.confidence);

    expect(forecast.topDrivers).toBeInstanceOf(Array);
    expect(forecast.topDrivers.length).toBeLessThanOrEqual(3);
    expect(forecast.topDrivers.length).toBeGreaterThan(0);
  });

  it('forecast topDrivers have correct fields', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/solar?country=CN&tech=topcon&year=2025',
    });
    const { forecast } = res.json();

    for (const driver of forecast.topDrivers) {
      expect(driver).toHaveProperty('material');
      expect(driver).toHaveProperty('changePct');
      expect(driver).toHaveProperty('weightPct');
      expect(driver).toHaveProperty('passThrough');
      expect(driver).toHaveProperty('lagLabel');
      expect(driver).toHaveProperty('signalContribution');
    }
  });

  it('forecast modeled cost matches model totalCostPerWp', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/solar?country=VN&tech=topcon&year=2025',
    });
    const body = res.json();
    expect(body.forecast.currentModeledCost).toBe(body.model.totalCostPerWp);
  });
});

describe('GET /api/page/wind — route integration', () => {
  it('returns 200 with valid wind data', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/wind?turbineType=onshore&year=2025',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.model.totalCostPerKw).toBeGreaterThan(1000);
    expect(body.stageBreakdown).toHaveLength(5);
    expect(body.materialImpacts.length).toBeGreaterThan(0);
    expect(body.meta).toHaveProperty('freshness');
  });

  it('uses defaults when no params provided', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/wind',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.params.turbineType).toBe('onshore');
    expect(body.params.year).toBe(2025);
  });

  it('rejects invalid turbine type', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/wind?turbineType=offshore',
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects year out of range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/wind?year=2040',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/page/brief — route integration', () => {
  it('returns 200 with brief data', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/brief',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('date');
    expect(body).toHaveProperty('movers');
    expect(Array.isArray(body.movers)).toBe(true);
  });

  it('brief has meta with liveMaterials count', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/brief',
    });
    const body = res.json();
    expect(body.meta).toHaveProperty('liveMaterials');
    expect(body.meta).toHaveProperty('totalMaterials');
  });
});

describe('GET /api/page/landed-cost — route integration', () => {
  it('returns comparison for all routes when no from/to', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?exw=0.179',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.selectedRoute).toBeNull();
    expect(body.comparison.length).toBeGreaterThanOrEqual(6);
    expect(body.routes.length).toBeGreaterThanOrEqual(6);
  });

  it('returns selected route + comparison when from/to provided', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?from=CN&to=VN&exw=0.179',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.selectedRoute).not.toBeNull();
    expect(body.selectedRoute.breakdown.ddp).toBeGreaterThan(0.179);
    expect(body.selectedRoute.model.hsCode).toBe('8541.43');
    expect(body.comparison.length).toBeGreaterThanOrEqual(6);
  });

  it('returns 400 for invalid route', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?from=CN&to=BR&exw=0.179',
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for invalid product', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?from=CN&to=VN&product=inverter&exw=0.179',
    });
    expect(res.statusCode).toBe(400);
  });

  it('uses default EXW 0.179 when not provided', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.comparison.length).toBeGreaterThanOrEqual(6);
  });

  it('returns 400 for non-numeric exw without from/to', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?exw=abc',
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/Invalid EXW/i);
  });

  it('returns 400 for invalid product without from/to', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?product=inverter&exw=0.179',
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/product/i);
  });

  it('returns 400 for negative exw without from/to', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/page/landed-cost?exw=-1',
    });
    expect(res.statusCode).toBe(400);
  });
});
