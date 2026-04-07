import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { registerMaterialRoutes } from '../routes/materials.js';

let app;

beforeAll(async () => {
  app = Fastify({ logger: false });
  registerMaterialRoutes(app);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/materials/:slug/history', () => {
  it('returns history for a live material', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/materials/silver/history?range=1mo',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.slug).toBe('silver');
    expect(body.range).toBe('1mo');
    expect(body.points.length).toBeGreaterThan(0);
    expect(['yahoo', 'snapshot_fallback', 'snapshot']).toContain(body.sourceKind);
    expect(body.availableRanges).toContain('1y');
  });

  it('returns snapshot-backed history for a reference material', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/materials/silicon/history?range=max',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.slug).toBe('silicon');
    expect(body.sourceKind).toBe('snapshot');
    expect(body.points.length).toBeGreaterThan(0);
  });

  it('rejects invalid ranges', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/materials/silver/history?range=10y',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/Invalid range/i);
  });

  it('returns 404 for unknown materials', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/materials/not-real/history?range=1mo',
    });

    expect(res.statusCode).toBe(404);
  });
});
