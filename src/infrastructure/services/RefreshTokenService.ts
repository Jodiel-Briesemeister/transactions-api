import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { randomUUID } from 'crypto';

export class RefreshTokenService implements IRefreshTokenService {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository,
    private expiresInDays: number,
  ) {}

  async createForUser(userId: string): Promise<string> {
    const token = randomUUID();

    await this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + this.expiresInDays * 24 * 60 * 60 * 1000),
    });

    return token;
  }
}
