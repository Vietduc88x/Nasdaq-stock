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

  // GET /api/page/solar-compare?countries=VN,CN,IN&tech=topcon&year=2025
  app.get('/api/page/solar-compare', async (request, reply) => {
    const countriesParam = request.query.countries || 'VN,CN,IN';
    const countries = [...new Set(countriesParam.split(',').map(c => c.trim().toUpperCase()).filter(Boolean))];
    const tech = (request.query.tech || 'topcon').toLowerCase();
    const year = parseInt(request.query.year || '2025', 10);

    const VALID_COUNTRIES = ['CN', 'VN', 'IN', 'DE', 'US', 'AU'];
    const VALID_TECHS = ['topcon', 'mono'];

    const invalidCountries = countries.filter(c => !VALID_COUNTRIES.includes(c));
    if (invalidCountries.length > 0 || countries.length < 2 || countries.length > 6) {
      reply.code(400);
      return { error: 'Provide 2-6 valid countries (CN, VN, IN, DE, US, AU)' };
    }
    if (!VALID_TECHS.includes(tech) || year < 2025 || year > 2030) {
      reply.code(400);
      return { error: 'Invalid tech or year' };
    }

    try {
      const results = countries.map(country => {
        const cost = calculateSolarCost(country, tech, year);
        return {
          country,
          totalCostPerWp: cost.totalCostPerWp,
          stageBreakdown: cost.stageBreakdown,
          model: cost.model,
        };
      });

      const cheapest = Math.min(...results.map(r => r.totalCostPerWp));

      const comparison = results.map(r => ({
        country: r.country,
        totalCostPerWp: r.totalCostPerWp,
        deltaVsCheapest: Math.round((r.totalCostPerWp - cheapest) * 10000) / 10000,
        deltaPct: Math.round(((r.totalCostPerWp - cheapest) / cheapest) * 1000) / 10,
        isCheapest: r.totalCostPerWp === cheapest,
        stageBreakdown: r.stageBreakdown,
      }));

      return {
        params: { countries, tech, year },
        cheapestCountry: results.find(r => r.totalCostPerWp === cheapest).country,
        cheapestCost: cheapest,
        comparison,
        model: { version: results[0].model.version, asOf: new Date().toISOString() },
      };
    } catch (err) {
      request.log.error({ err, countries, tech, year }, 'Page solar-compare error');
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

      // Filter materials by chemistry: LFP and NMC811 use different cathode materials
      const LFP_ONLY = ['iron-phosphate'];          // LFP cathode precursor — not in NMC
      const NMC_ONLY = ['nickel', 'cobalt'];         // NMC cathode metals — not in LFP
      const EXCLUDE = chemistry === 'lfp' ? NMC_ONLY : LFP_ONLY;
      const bessMaterials = getSystemMaterials('bess')
        .filter(m => !EXCLUDE.includes(m.slug));

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
