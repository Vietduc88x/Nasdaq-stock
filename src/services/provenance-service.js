const MODEL_VERSIONS = {
  solar: 'solar-irena-v2026.03',
  bess: 'bess-argonne-v2024'
};

/**
 * Build provenance metadata for a response.
 */
export function buildProvenance(modelType, { liveCoverage = 0, referenceCoverage = 0, fallbacksUsed = [] } = {}) {
  const totalCoverage = liveCoverage + referenceCoverage;
  const livePct = totalCoverage > 0 ? Math.round((liveCoverage / totalCoverage) * 100) : 0;

  return {
    modelVersion: MODEL_VERSIONS[modelType] || 'unknown',
    asOf: new Date().toISOString(),
    freshness: livePct > 80 ? 'fresh' : livePct > 40 ? 'mixed' : 'mostly_reference',
    liveCoveragePct: livePct,
    referenceCoveragePct: 100 - livePct,
    fallbacksUsed
  };
}

/**
 * Get all available model versions.
 */
export function getModelVersions() {
  return { ...MODEL_VERSIONS };
}
