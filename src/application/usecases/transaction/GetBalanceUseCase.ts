import { AppError } from '@domain/errors/AppError';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { ILogger } from '@domain/interfaces/ILogger';

interface Request {
  userId: string;
}

export class GetBalanceUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private logger: ILogger,
  ) {}

  async execute({ userId }: Request) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      this.logger.error('Account not found for existing user', { userId });
      throw new AppError('Account not found', 404);
    }

    return { balance: account.balance };
  }
}
