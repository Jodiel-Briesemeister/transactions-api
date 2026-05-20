import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { ITokenBlacklistService } from '@domain/interfaces/ITokenBlacklistService';

interface Request {
  refreshToken: string;
  accessToken: string;
}

export class LogoutUseCase {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository,
    private tokenBlacklistService: ITokenBlacklistService,
    private authService: IAuthService,
  ) {}

  async execute({ refreshToken, accessToken }: Request): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const ttl = this.authService.getTokenExpiresIn(accessToken);
    if (ttl > 0) await this.tokenBlacklistService.add(accessToken, ttl);
  }
}
