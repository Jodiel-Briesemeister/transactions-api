import { Router } from 'express';
import { container } from '@shared/container';
import { HealthService } from '@infrastructure/services/HealthService';
import { asyncHandler } from '@presentation/middlewares/asyncHandler';

const router = Router();

router.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

router.get(
  '/health/dependencies',
  asyncHandler(async (_req, res) => {
    const healthService = container.resolve<HealthService>('healthService');

    const [postgres, redis] = await Promise.all([
      healthService.checkDatabase(),
      healthService.checkRedis(),
    ]);

    const allHealthy = postgres.status === 'ok' && redis.status === 'ok';

    return res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      dependencies: { postgres, redis },
    });
  }),
);

export default router;
