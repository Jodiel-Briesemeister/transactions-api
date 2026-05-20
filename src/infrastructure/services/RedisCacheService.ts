import { ICacheService } from '@domain/interfaces/ICacheService';
import Redis from 'ioredis';

export class RedisCacheService implements ICacheService {
  constructor(private redis: Redis) {}

  async get(namespace: string, key: string): Promise<string | null> {
    return this.redis.get(`${namespace}:${key}`);
  }

  async set(namespace: string, key: string, value: string, ttlSeconds = 300): Promise<void> {
    await this.redis.set(`${namespace}:${key}`, value, 'EX', ttlSeconds);
  }

  async delete(namespace: string, key: string): Promise<void> {
    await this.redis.del(`${namespace}:${key}`);
  }
}
