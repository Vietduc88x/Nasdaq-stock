import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerHealthRoutes } from './routes/health.js';
import { registerMaterialRoutes } from './routes/materials.js';
import { registerSolarRoutes } from './routes/solar.js';
import { registerPageDataRoutes } from './routes/page-data.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } }
      : undefined
  }
});

await app.register(cors, {
  origin: [
    'https://market.techmadeeasy.info',
    'http://localhost:3000',
    'http://localhost:3004'
  ]
});

// Request logging
app.addHook('onResponse', (request, reply, done) => {
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration: reply.elapsedTime
  }, 'request completed');
  done();
});

// Routes
registerHealthRoutes(app);
registerMaterialRoutes(app);
registerSolarRoutes(app);
registerPageDataRoutes(app);

const port = parseInt(process.env.PORT || '3004', 10);
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`Market API listening on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export default app;
