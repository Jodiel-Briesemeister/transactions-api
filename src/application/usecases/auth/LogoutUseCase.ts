import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';

export class LogoutUseCase {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute({ refreshToken }: { refreshToken: string}): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }
}
