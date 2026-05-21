import { createTerminus } from '@godaddy/terminus';
import { app } from '@main/app';
import { shutdownTelemetry } from '@main/telemetry';
import { env } from '@shared/env';
import { container } from '@shared/container';
import { registerJobs } from '@main/jobs';

const logger = container.resolve('logger');
const db = container.resolve('db');
const redis = container.resolve('redis');

registerJobs();

const server = app.listen(Number(env.port), env.host, () => {
  logger.info(`Server running on ${env.host}:${env.port}`);
});

createTerminus(server, {
  timeout: 10_000,
  signals: ['SIGTERM', 'SIGINT'],
  onSignal: async () => {
    logger.info('Shutdown signal received, closing connections');
    await Promise.allSettled([
      db.destroy(),
      redis.quit(),
      shutdownTelemetry(),
    ]);
  },
  onShutdown: async () => {
    logger.info('Server shutdown complete');
  },
  logger: (msg, err) => logger.error(msg, { error: err }),
});
