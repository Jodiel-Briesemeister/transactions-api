import Redis from 'ioredis';
import { ILogger } from '@domain/interfaces/ILogger';
import { env } from '@shared/env';

export const createRedisConnection = (logger: ILogger): Redis => {
  const client = new Redis({ host: env.redisHost, port: env.redisPort });

  client.on('error', (err: Error) => {
    logger.error('Redis connection error', { message: err.message });
  });

  return client;
};
