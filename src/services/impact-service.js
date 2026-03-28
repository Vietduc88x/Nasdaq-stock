import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catalog = JSON.parse(
  readFileSync(join(__dirname, '../data/materials/catalog.json'), 'utf-8')
);

const materialsMap = new Map(catalog.materials.map(m => [m.slug, m]));

/**
 * Calculate cross-system impact when a material price changes by changePct%.
 */
export function calculateImpact(materialSlug, changePct) {
  const material = materialsMap.get(materialSlug);
  if (!material) return null;

  const factor = changePct / 100;

  const impacts = material.systems.map(s => {
    const baselineCost = s.baselineCost_usdPerWp ?? s.baselineCost_usdPerKWh ?? s.baselineCost_usdPerKW ?? 0;
    const delta = baselineCost * factor;

    return {
      system: s.system,
      component: s.component,
      baselineCost,
      costUnit: s.baselineCost_usdPerWp !== undefined ? 'USD/Wp'
        : s.baselineCost_usdPerKWh !== undefined ? 'USD/kWh'
        : 'USD/kW',
      delta: Math.round(delta * 100000) / 100000,
      usagePerUnit: s.usage_gPerWp ?? s.usage_gPerWh ?? s.usage_gPerKW ?? 0,
      usageUnit: s.usage_gPerWp !== undefined ? 'g/Wp'
        : s.usage_gPerWh !== undefined ? 'g/Wh'
        : 'g/kW'
    };
  });

  return {
    material: materialSlug,
    name: material.name,
    changePct,
    coverageTier: material.coverageTier,
    impacts
  };
}

/**
 * Get material breakdown for a specific system.
 * Returns all materials that contribute to that system's cost.
 */
export function getSystemMaterials(systemType) {
  const results = [];

  for (const material of catalog.materials) {
    for (const s of material.systems) {
      if (s.system === systemType) {
        const baselineCost = s.baselineCost_usdPerWp ?? s.baselineCost_usdPerKWh ?? s.baselineCost_usdPerKW ?? 0;
        results.push({
          slug: material.slug,
          name: material.name,
          icon: material.icon,
          coverageTier: material.coverageTier,
          component: s.component,
          baselineCost,
          costUnit: s.baselineCost_usdPerWp !== undefined ? 'USD/Wp'
            : s.baselineCost_usdPerKWh !== undefined ? 'USD/kWh'
            : 'USD/kW',
          usagePerUnit: s.usage_gPerWp ?? s.usage_gPerWh ?? s.usage_gPerKW ?? 0,
          usageUnit: s.usage_gPerWp !== undefined ? 'g/Wp'
            : s.usage_gPerWh !== undefined ? 'g/Wh'
            : 'g/kW'
        });
      }
    }
  }

  // Sort by cost contribution descending
  results.sort((a, b) => b.baselineCost - a.baselineCost);
  return results;
}

/**
 * Get the full materials catalog.
 */
export function getAllMaterials() {
  return catalog.materials;
}

/**
 * Get a single material by slug.
 */
export function getMaterial(slug) {
  return materialsMap.get(slug) || null;
}
