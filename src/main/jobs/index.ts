import { registerCleanupExpiredTokensJob } from './cleanupExpiredTokens';

export function registerJobs() {
  registerCleanupExpiredTokensJob();
}
