import rateLimit from 'express-rate-limit';
import { RedisReply, RedisStore } from 'rate-limit-redis';
import { container } from '@shared/container';
import { env } from '@shared/env';
import Redis from 'ioredis';

const redis = container.resolve<Redis>('redis');

function createRateLimiter(limit: number) {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>,
    }),
  });
}

export const globalRateLimiter = createRateLimiter(env.rateLimitGlobalTries);
export const authRateLimiter = createRateLimiter(env.rateLimitAuthTries);
export const loginRateLimiter = createRateLimiter(env.rateLimitLoginTries);