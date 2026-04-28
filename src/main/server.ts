import { app } from '@main/app'
import { env } from '@shared/env';
import { container } from '@shared/container';
import { registerJobs } from '@main/jobs';

const logger = container.resolve('logger');

registerJobs();

app.listen(Number(env.port), env.host, () => {
  logger.info(`Server running on ${env.host}:${env.port}`);
});
