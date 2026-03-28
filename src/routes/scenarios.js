import { calculateSolarCost } from '../services/solar-model-service.js';

export function registerScenarioRoutes(app) {
  app.post('/api/scenarios/solar', async (request, reply) => {
    const { country = 'VN', tech = 'topcon', year = 2025 } = request.body || {};
    const VALID_COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    const VALID_TECHS = ['topcon', 'mono'];
    if (!VALID_COUNTRIES.includes(country) || !VALID_TECHS.includes(tech) || year < 2025 || year > 2030) {
      reply.code(400);
      return { error: 'Invalid parameters' };
    }
    const result = calculateSolarCost(country, tech, year);
    return {
      baseline: result.totalCostPerWp,
      stages: result.stageBreakdown.map(s => ({ stage: s.stage, cost: s.costPerWp })),
      model: result.model
    };
  });
}
