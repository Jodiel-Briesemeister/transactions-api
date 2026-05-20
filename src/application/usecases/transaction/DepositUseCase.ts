import { ITransactionRepository } from '@domain/interfaces/ITransactionRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';
import { AppError } from '@domain/errors/AppError';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';

interface Request {
  userId: string;
  amount: number;
}

export class DepositUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository,
    private logger: ILogger,
    private unitOfWork: IUnitOfWork,
  ) {}

  async execute({ userId, amount }: Request) {
    if (amount <= 0) throw new AppError('Amount must be greater than zero', 422);

    await this.unitOfWork.transaction(async (trx) => {
      const account = await this.accountRepository.findByUserId(userId, trx);
      if (!account) throw new AppError('Account not found', 404);

      const transaction = Transaction.create({
        userId,
        type: TransactionType.DEPOSIT,
        amount,
        recipientId: null,
      });

      await this.transactionRepository.create(transaction, trx);
      await this.accountRepository.updateBalance(userId, amount, trx);
    });

    this.logger.info('Deposit completed', { userId, amount });
  }
}
