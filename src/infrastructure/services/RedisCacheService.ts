import { ICacheService } from '@domain/interfaces/ICacheService';
import { env } from '@shared/env';
import Redis from 'ioredis';

export class RedisCacheService implements ICacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: env.redisHost,
      port: env.redisPort,
    });
  }

  async get(namespace: string, key: string): Promise<string | null> {
    return this.client.get(`${namespace}:${key}`);
  }

  async set(namespace: string, key: string, value: string, ttlSeconds = 300): Promise<void> {
    await this.client.set(`${namespace}:${key}`, value, 'EX', ttlSeconds);
  }

  async delete(namespace: string, key: string): Promise<void> {
    await this.client.del(`${namespace}:${key}`);
  }
}
