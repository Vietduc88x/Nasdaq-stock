import { describe, it, expect } from 'vitest';
import { calculateImpact, getSystemMaterials, getAllMaterials, getMaterial } from '../services/impact-service.js';

describe('Impact Service', () => {
  describe('getAllMaterials', () => {
    it('returns 21 materials', () => {
      const materials = getAllMaterials();
      expect(materials.length).toBe(21);
    });
  });

  describe('getMaterial', () => {
    it('returns silver by slug', () => {
      const m = getMaterial('silver');
      expect(m.name).toBe('Silver');
      expect(m.coverageTier).toBe('live_exchange');
    });

    it('returns null for unknown slug', () => {
      expect(getMaterial('unobtanium')).toBeNull();
    });
  });

  describe('getSystemMaterials', () => {
    it('returns solar materials sorted by cost', () => {
      const materials = getSystemMaterials('solar');
      expect(materials.length).toBeGreaterThan(0);
      // Glass should be highest cost material for solar
      expect(materials[0].baselineCost).toBeGreaterThanOrEqual(materials[1].baselineCost);
    });

    it('returns bess materials', () => {
      const materials = getSystemMaterials('bess');
      expect(materials.length).toBeGreaterThan(0);
      expect(materials.some(m => m.slug === 'lithium')).toBe(true);
    });

    it('returns wind materials', () => {
      const materials = getSystemMaterials('wind');
      expect(materials.length).toBeGreaterThan(0);
      // Steel should be dominant for wind
      expect(materials[0].slug).toBe('steel');
    });
  });

  describe('calculateImpact', () => {
    it('calculates silver +10% impact on solar', () => {
      const impact = calculateImpact('silver', 10);
      expect(impact).not.toBeNull();
      expect(impact.material).toBe('silver');
      expect(impact.changePct).toBe(10);
      expect(impact.impacts.length).toBe(1); // silver only in solar
      expect(impact.impacts[0].system).toBe('solar');
      expect(impact.impacts[0].delta).toBeGreaterThan(0);
    });

    it('calculates copper impact across all 3 systems', () => {
      const impact = calculateImpact('copper', 10);
      expect(impact.impacts.length).toBe(3);
      const systems = impact.impacts.map(i => i.system).sort();
      expect(systems).toEqual(['bess', 'solar', 'wind']);
    });

    it('returns null for unknown material', () => {
      expect(calculateImpact('unobtanium', 10)).toBeNull();
    });

    it('handles negative price changes', () => {
      const impact = calculateImpact('silver', -20);
      expect(impact.impacts[0].delta).toBeLessThan(0);
    });
  });
});
