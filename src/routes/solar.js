import { calculateSolarCost, getBenchmark, getModelMeta } from '../services/solar-model-service.js';
import { getSystemMaterials } from '../services/impact-service.js';

const VALID_COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
const VALID_TECHS = ['topcon', 'mono'];
const VALID_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

function validateSolarParams(query) {
  const errors = [];
  const country = (query.country || '').toUpperCase();
  const tech = (query.tech || '').toLowerCase();
  const year = parseInt(query.year || '2025', 10);

  if (!VALID_COUNTRIES.includes(country)) {
    errors.push(`country must be one of: ${VALID_COUNTRIES.join(', ')}`);
  }
  if (!VALID_TECHS.includes(tech)) {
    errors.push(`tech must be one of: ${VALID_TECHS.join(', ')}`);
  }
  if (!VALID_YEARS.includes(year)) {
    errors.push(`year must be between 2025 and 2030`);
  }

  return { country, tech, year, errors };
}

export function registerSolarRoutes(app) {
  // GET /api/solar/cost?country=VN&tech=topcon&year=2025
  app.get('/api/solar/cost', async (request, reply) => {
    const { country, tech, year, errors } = validateSolarParams(request.query);

    if (errors.length > 0) {
      reply.code(400);
      return { error: 'Invalid parameters', details: errors };
    }

    try {
      const result = calculateSolarCost(country, tech, year);
      const benchmark = getBenchmark(country, tech, year);

      let benchmarkDeltaPct = null;
      if (benchmark?.total) {
        benchmarkDeltaPct = Math.round(((result.totalCostPerWp - benchmark.total) / benchmark.total) * 10000) / 100;
      }

      return {
        ...result,
        benchmark: benchmark ? { reference: benchmark.total, deltaPct: benchmarkDeltaPct } : null
      };
    } catch (err) {
      request.log.error({ err, country, tech, year }, 'Solar model calculation error');
      reply.code(500);
      return { error: 'Calculation error', message: err.message };
    }
  });

  // GET /api/solar/breakdown?country=VN&tech=topcon&year=2025
  app.get('/api/solar/breakdown', async (request, reply) => {
    const { country, tech, year, errors } = validateSolarParams(request.query);

    if (errors.length > 0) {
      reply.code(400);
      return { error: 'Invalid parameters', details: errors };
    }

    try {
      const cost = calculateSolarCost(country, tech, year);
      const materials = getSystemMaterials('solar');

      const totalMaterialCost = materials.reduce((sum, m) => sum + m.baselineCost, 0);
      const materialPct = Math.round((totalMaterialCost / cost.totalCostPerWp) * 1000) / 10;

      return {
        totalCostPerWp: cost.totalCostPerWp,
        stageBreakdown: cost.stageBreakdown,
        materialBreakdown: {
          totalMaterialCost: Math.round(totalMaterialCost * 10000) / 10000,
          materialSharePct: materialPct,
          materials: materials.map(m => ({
            ...m,
            shareOfSystemPct: Math.round((m.baselineCost / cost.totalCostPerWp) * 1000) / 10,
            impactPer10Pct: Math.round(m.baselineCost * 0.1 * 100000) / 100000
          }))
        },
        model: cost.model
      };
    } catch (err) {
      request.log.error({ err, country, tech, year }, 'Solar breakdown calculation error');
      reply.code(500);
      return { error: 'Calculation error', message: err.message };
    }
  });

  // GET /api/solar/meta
  app.get('/api/solar/meta', async () => {
    return getModelMeta();
  });
}
