import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';

interface Request {
  userId: string;
}

export class GetProfileUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private logger: ILogger,
  ) {}

  async execute({ userId }: Request) {
    const user = await this.cachedUserRepository.findById(userId);

    if (!user) {
      this.logger.warn('User not found', { userId });
      throw new AppError('User not found', 404);
    }

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }
}
