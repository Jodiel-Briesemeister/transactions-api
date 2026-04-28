import { AppError } from "@domain/errors/AppError";
import { IAuthService } from "@domain/interfaces/IAuthService";
import { IRefreshTokenRepository } from "@domain/interfaces/IRefreshTokenRepository";
import { IRefreshTokenService } from "@domain/interfaces/IRefreshTokenService";

export class RefreshTokenUseCase {
  constructor(
    private authService: IAuthService,
    private refreshTokenRepository: IRefreshTokenRepository,
    private refreshTokenService: IRefreshTokenService,
  ) {}

  async execute({ refreshToken }: { refreshToken: string}) {
    const stored = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!stored) throw new Error('Invalid refresh token');

    if (new Date() > stored.expiresAt) {
      throw new AppError('Expired refresh token', 401);
    }

    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const newAccessToken = this.authService.generateAccessToken(stored.userId);
    const newRefreshToken = await this.refreshTokenService.createForUser(stored.userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
