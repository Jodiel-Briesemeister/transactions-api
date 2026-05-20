import cron from 'node-cron';
import { container } from '@shared/container';

export function registerCleanupExpiredTokensJob() {
  cron.schedule('0 3 * * *', async () => {
    const refreshTokenRepository = container.resolve('refreshTokenRepository');
    await refreshTokenRepository.deleteExpired();
  });
}
