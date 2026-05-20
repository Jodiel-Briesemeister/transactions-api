import { IUserRepository, UpdateUserData } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';

interface Request {
  userId: string;
  name?: string;
  email?: string;
  phone?: string | null;
}

export class UpdateProfileUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private logger: ILogger,
  ) {}

  async execute({ userId, name, email, phone }: Request) {
    const user = await this.cachedUserRepository.findById(userId);

    if (!user) {
      this.logger.warn('User not found', { userId });
      throw new AppError('User not found', 404);
    }

    if (email && email !== user.email) {
      const existingUser = await this.cachedUserRepository.findByEmail(email);
      if (existingUser) {
        this.logger.warn('Email already in use', { email });
        throw new AppError('Email already in use', 409);
      }
    }

    const updated = await this.cachedUserRepository.update(userId, { name, email, phone });

    this.logger.info('User updated', { userId });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt,
    };
  }
}
