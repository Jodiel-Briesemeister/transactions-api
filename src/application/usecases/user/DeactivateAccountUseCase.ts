import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';
import { IMessagePublisher } from '@domain/interfaces/IMessagePublisher';
import { Queue } from '@domain/enums/Queue';
import { NotificationTemplate } from '@domain/enums/NotificationTemplate';

interface Request {
  userId: string;
}

export class DeactivateAccountUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private logger: ILogger,
    private messagePublisher: IMessagePublisher,
  ) {}

  async execute({ userId }: Request) {
    const user = await this.cachedUserRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    await this.refreshTokenRepository.deleteAllByUser(userId);
    await this.cachedUserRepository.deactivate(userId);

    this.logger.info('User deactivated', { userId });
    this.messagePublisher.publish(Queue.NotificationsEmail, {
      templateId: NotificationTemplate.UserDeactivated,
      userName: user.name,
      userEmail: user.email,
    });
  }
}
