import cron from 'node-cron';
import { container } from '@shared/container';
import { ILogger } from '@domain/interfaces/ILogger';

export function registerCleanupExpiredTokensJob() {
  cron.schedule('0 3 * * *', async () => {
    const logger = container.resolve<ILogger>('logger');
    const refreshTokenRepository = container.resolve('refreshTokenRepository');

    logger.info('Job started: cleanup expired refresh tokens');

    try {
      await refreshTokenRepository.deleteExpired();
      logger.info('Job completed: cleanup expired refresh tokens');
    } catch (err) {
      logger.error('Job failed: cleanup expired refresh tokens', { error: err });
    }
  });
}
