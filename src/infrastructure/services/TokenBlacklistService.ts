import { ITokenBlacklistService } from '@domain/interfaces/ITokenBlacklistService';
import { ICacheService } from '@domain/interfaces/ICacheService';

export class TokenBlacklistService implements ITokenBlacklistService {
  constructor(private cacheService: ICacheService) {}

  async add(token: string, ttlSeconds: number): Promise<void> {
    await this.cacheService.set('blacklist', token, 'true', ttlSeconds);
  }

  async has(token: string): Promise<boolean> {
    const result = await this.cacheService.get('blacklist', token);
    return result !== null;
  }
}
