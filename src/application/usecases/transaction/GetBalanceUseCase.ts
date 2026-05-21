import { AppError } from '@domain/errors/AppError';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';

interface Request {
  userId: string;
}

export class GetBalanceUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute({ userId }: Request) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) throw new AppError('Account not found', 404);

    return { balance: account.balance };
  }
}
