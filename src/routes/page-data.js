import { calculateSolarCost } from '../services/solar-model-service.js';
import { calculateBessCost } from '../services/bess-cost-engine.js';
import { getSystemMaterials, getAllMaterials } from '../services/impact-service.js';
import { getAllPrices, getPrice } from '../services/market-data-service.js';
import { buildProvenance } from '../services/provenance-service.js';

export function registerPageDataRoutes(app) {
  // GET /api/page/home - Dashboard page payload
  app.get('/api/page/home', async () => {
    const materials = getAllMaterials();
    const prices = await getAllPrices();

    const priceMap = new Map(prices.map(p => [p.slug, p.price]));

    let liveCoverage = 0;
    let referenceCoverage = 0;

    const enrichedMaterials = materials.map(m => {
      const price = priceMap.get(m.slug);
      if (price?.coverageTier === 'live_exchange' && !price?.fallbackUsed) {
        liveCoverage++;
      } else {
        referenceCoverage++;
      }

      return {
        slug: m.slug,
        name: m.name,
        icon: m.icon,
        category: m.category,
        coverageTier: m.coverageTier,
        systems: m.systems.map(s => s.system),
        currentPrice: price || null
      };
    });

    // Featured solar impact summary
    const solarCost = calculateSolarCost('VN', 'topcon', 2025);

    return {
      materials: enrichedMaterials,
      featuredSolar: {
        country: 'VN',
        tech: 'topcon',
        year: 2025,
        totalCostPerWp: solarCost.totalCostPerWp
      },
      meta: buildProvenance('solar', { liveCoverage, referenceCoverage })
    };
  });

  // GET /api/page/solar?country=VN&tech=topcon&year=2025
  app.get('/api/page/solar', async (request, reply) => {
    const country = (request.query.country || 'VN').toUpperCase();
    const tech = (request.query.tech || 'topcon').toLowerCase();
    const year = parseInt(request.query.year || '2025', 10);

    const VALID_COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    const VALID_TECHS = ['topcon', 'mono'];

    if (!VALID_COUNTRIES.includes(country) || !VALID_TECHS.includes(tech) || year < 2025 || year > 2030) {
      reply.code(400);
      return { error: 'Invalid parameters' };
    }

    try {
      const cost = calculateSolarCost(country, tech, year);
      const solarMaterials = getSystemMaterials('solar');

      // Fetch live prices for solar materials
      let liveCoverage = 0;
      let referenceCoverage = 0;
      const fallbacksUsed = [];

      const materialImpacts = await Promise.all(
        solarMaterials.map(async (m) => {
          const price = await getPrice(m.slug);
          if (price?.coverageTier === 'live_exchange' && !price?.fallbackUsed) {
            liveCoverage++;
          } else {
            referenceCoverage++;
            if (price?.fallbackUsed) fallbacksUsed.push(m.slug);
          }

          return {
            material: m.slug,
            name: m.name,
            icon: m.icon,
            coverageTier: price?.coverageTier || m.coverageTier,
            priceSource: price?.source || 'reference',
            asOf: price?.asOf || null,
            currentPrice: price ? { value: price.value, unit: price.unit } : null,
            baselineContributionPerWp: m.baselineCost,
            shareOfSystemPct: Math.round((m.baselineCost / cost.totalCostPerWp) * 1000) / 10,
            impactPer10Pct: Math.round(m.baselineCost * 0.1 * 100000) / 100000,
            component: m.component
          };
        })
      );

      return {
        params: { country, tech, year },
        model: {
          version: cost.model.version,
          asOf: new Date().toISOString(),
          totalCostPerWp: cost.totalCostPerWp
        },
        stageBreakdown: cost.stageBreakdown,
        materialImpacts,
        meta: buildProvenance('solar', { liveCoverage, referenceCoverage, fallbacksUsed })
      };
    } catch (err) {
      request.log.error({ err, country, tech, year }, 'Page solar error');
      reply.code(500);
      return { error: 'Calculation error' };
    }
  });

  // GET /api/page/material/:slug
  app.get('/api/page/material/:slug', async (request, reply) => {
    const { getAllMaterials, getMaterial, calculateImpact } = await import('../services/impact-service.js');
    const material = getMaterial(request.params.slug);
    if (!material) {
      reply.code(404);
      return { error: 'Material not found' };
    }

    const price = await getPrice(request.params.slug);
    const impact = calculateImpact(request.params.slug, 10);

    return {
      material: {
        slug: material.slug,
        name: material.name,
        icon: material.icon,
        category: material.category,
        coverageTier: material.coverageTier,
        unit: material.unit,
        yahooSymbol: material.yahooSymbol || null,
      },
      currentPrice: price,
      crossSystemImpact: impact?.impacts || [],
      meta: {
        asOf: new Date().toISOString()
      }
    };
  });

  // GET /api/page/bess?chemistry=lfp&year=2025
  app.get('/api/page/bess', async (request, reply) => {
    const chemistry = (request.query.chemistry || 'lfp').toLowerCase();
    const year = parseInt(request.query.year || '2025', 10);

    const VALID_CHEMISTRIES = ['lfp', 'nmc811'];
    if (!VALID_CHEMISTRIES.includes(chemistry) || year < 2025 || year > 2035) {
      reply.code(400);
      return { error: 'Invalid parameters. chemistry: lfp|nmc811, year: 2025-2035' };
    }

    try {
      const cost = calculateBessCost(chemistry, year);
      const bessMaterials = getSystemMaterials('bess');

      let liveCoverage = 0;
      let referenceCoverage = 0;
      const fallbacksUsed = [];

      const materialImpacts = await Promise.all(
        bessMaterials.map(async (m) => {
          const price = await getPrice(m.slug);
          if (price?.coverageTier === 'live_exchange' && !price?.fallbackUsed) {
            liveCoverage++;
          } else {
            referenceCoverage++;
            if (price?.fallbackUsed) fallbacksUsed.push(m.slug);
          }

          return {
            material: m.slug,
            name: m.name,
            icon: m.icon,
            coverageTier: price?.coverageTier || m.coverageTier,
            priceSource: price?.source || 'reference',
            asOf: price?.asOf || null,
            currentPrice: price ? { value: price.value, unit: price.unit } : null,
            baselineCost: m.baselineCost,
            costUnit: m.costUnit,
            component: m.component,
          };
        })
      );

      return {
        params: { chemistry, year },
        model: {
          version: cost.model.version,
          costingMethod: cost.model.costingMethod,
          asOf: new Date().toISOString(),
          totalCostPerKwh: cost.totalCostPerKwh,
        },
        stageBreakdown: cost.stageBreakdown,
        materialImpacts,
        meta: buildProvenance('bess', { liveCoverage, referenceCoverage, fallbacksUsed }),
      };
    } catch (err) {
      request.log.error({ err, chemistry, year }, 'Page BESS error');
      reply.code(500);
      return { error: 'Calculation error' };
    }
  });
}
