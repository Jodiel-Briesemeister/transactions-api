import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ITransactionRepository } from '@domain/interfaces/ITransactionRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';
import { AppError } from '@domain/errors/AppError';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';

interface Request {
  userId: string;
  recipientId: string;
  amount: number;
}

export class TransferUseCase {
  constructor(
    private userRepository: IUserRepository,
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository,
    private logger: ILogger,
    private unitOfWork: IUnitOfWork,
  ) {}

  async execute({ userId, recipientId, amount }: Request) {
    if (amount <= 0) throw new AppError('Amount must be greater than zero', 422);
    if (userId === recipientId) throw new AppError('Cannot transfer to yourself', 422);

    await this.unitOfWork.transaction(async (trx) => {
      const [account, recipientAccount] = await Promise.all([
        this.accountRepository.findByUserId(userId, trx),
        this.userRepository.findById(recipientId, trx),
      ]);

      if (!account) throw new AppError('Account not found', 404);
      if (!recipientAccount) throw new AppError('Recipient account not found', 404);
      if (account.balance < amount) throw new AppError('Insufficient balance', 422);

      const transaction = Transaction.create({
        userId,
        type: TransactionType.TRANSFER,
        amount,
        recipientId,
      });

      await this.transactionRepository.create(transaction, trx);
      await this.accountRepository.updateBalance(userId, -amount, trx);
      await this.accountRepository.updateBalance(recipientId, amount, trx);
    });

    this.logger.info('Transfer completed', { userId, recipientId, amount });
  }
}
