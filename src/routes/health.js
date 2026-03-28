import { getCacheStatus } from '../services/market-data-service.js';
import { getModelVersions } from '../services/provenance-service.js';

const startTime = Date.now();

export function registerHealthRoutes(app) {
  app.get('/api/health/live', async () => {
    return { status: 'ok', uptime: Math.round((Date.now() - startTime) / 1000) };
  });

  app.get('/api/health/ready', async () => {
    const cache = getCacheStatus();
    const models = getModelVersions();

    return {
      status: 'ok',
      uptime: Math.round((Date.now() - startTime) / 1000),
      cache,
      models,
      ready: true
    };
  });
}
