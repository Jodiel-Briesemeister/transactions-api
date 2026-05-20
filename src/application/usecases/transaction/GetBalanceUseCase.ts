import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';

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
    if (!account) throw new AppError('Account not found', 404);

    this.logger.info('Balance retrieved', { userId });

    return { balance: account.balance };
  }
}
