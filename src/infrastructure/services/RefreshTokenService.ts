import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { v7 as uuidv7 } from 'uuid';

export class RefreshTokenService implements IRefreshTokenService {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository,
    private expiresInDays: number,
  ) {}

  async createForUser(userId: string): Promise<string> {
    const token = uuidv7();

    await this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + this.expiresInDays * 24 * 60 * 60 * 1000),
    });

    return token;
  }
}
