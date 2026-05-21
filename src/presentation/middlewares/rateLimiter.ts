import rateLimit from 'express-rate-limit';
import { RedisReply, RedisStore } from 'rate-limit-redis';
import { container } from '@shared/container';
import { env } from '@shared/env';
import { ILogger } from '@domain/interfaces/ILogger';
import Redis from 'ioredis';

const redis = container.resolve<Redis>('redis');
const logger = container.resolve<ILogger>('logger');

function createRateLimiter(limit: number) {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>,
    }),
    handler: (req, res, _next, options) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        method: req.method,
        path: req.path,
      });
      res.status(options.statusCode).json({ message: 'Too many requests, please try again later' });
    },
  });
}

export const globalRateLimiter = createRateLimiter(env.rateLimitGlobalTries);
export const authRateLimiter = createRateLimiter(env.rateLimitAuthTries);
export const loginRateLimiter = createRateLimiter(env.rateLimitLoginTries);
