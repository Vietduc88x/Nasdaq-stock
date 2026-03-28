import { getAllMaterials, getMaterial, calculateImpact, getSystemMaterials } from '../services/impact-service.js';
import { getPrice } from '../services/market-data-service.js';

export function registerMaterialRoutes(app) {
  // GET /api/materials - full catalog with optional filter
  app.get('/api/materials', async (request) => {
    const { filter } = request.query; // solar, bess, wind, or omit for all
    let materials = getAllMaterials();

    if (filter && ['solar', 'bess', 'wind'].includes(filter)) {
      materials = materials.filter(m =>
        m.systems.some(s => s.system === filter)
      );
    }

    return {
      count: materials.length,
      materials: materials.map(m => ({
        slug: m.slug,
        name: m.name,
        icon: m.icon,
        unit: m.unit,
        fallbackPrice: m.fallbackPrice,
        coverageTier: m.coverageTier,
        category: m.category,
        systems: m.systems.map(s => s.system)
      }))
    };
  });

  // GET /api/materials/:slug - single material detail
  app.get('/api/materials/:slug', async (request, reply) => {
    const material = getMaterial(request.params.slug);
    if (!material) {
      reply.code(404);
      return { error: 'Material not found', slug: request.params.slug };
    }

    const price = await getPrice(request.params.slug);

    return {
      ...material,
      currentPrice: price
    };
  });

  // GET /api/materials/:slug/impact?changePct=10
  app.get('/api/materials/:slug/impact', async (request, reply) => {
    const changePct = parseFloat(request.query.changePct ?? '10');

    if (isNaN(changePct) || changePct < -50 || changePct > 100) {
      reply.code(400);
      return { error: 'changePct must be between -50 and 100' };
    }

    const impact = calculateImpact(request.params.slug, changePct);
    if (!impact) {
      reply.code(404);
      return { error: 'Material not found', slug: request.params.slug };
    }

    return impact;
  });
}
