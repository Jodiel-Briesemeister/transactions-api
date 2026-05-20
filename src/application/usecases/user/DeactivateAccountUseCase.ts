import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';

interface Request {
  userId: string;
}

export class DeactivateAccountUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private logger: ILogger,
  ) {}

  async execute({ userId }: Request) {
    const user = await this.cachedUserRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    await this.refreshTokenRepository.deleteAllByUser(userId);
    await this.cachedUserRepository.deactivate(userId);

    this.logger.info('User deactivated', { userId });
  }
}
