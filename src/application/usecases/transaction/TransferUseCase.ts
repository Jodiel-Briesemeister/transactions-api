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
  recipientEmail: string;
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

  async execute({ userId, recipientEmail, amount }: Request) {
    if (amount <= 0) throw new AppError('Amount must be greater than zero', 422);

    await this.unitOfWork.transaction(async (trx) => {
      const [account, recipient] = await Promise.all([
        this.accountRepository.findByUserId(userId, trx),
        this.userRepository.findByEmail(recipientEmail, trx),
      ]);

      if (!account) {
        this.logger.error('Account not found for existing user', { userId });
        throw new AppError('Account not found', 404);
      }
      if (!recipient) throw new AppError('Recipient not found', 404);
      if (recipient.id === userId) throw new AppError('Cannot transfer to yourself', 422);
      if (account.balance < amount) throw new AppError('Insufficient balance', 422);

      const transaction = Transaction.create({
        userId,
        type: TransactionType.TRANSFER,
        amount,
        recipientId: recipient.id,
      });

      await this.transactionRepository.create(transaction, trx);
      await this.accountRepository.updateBalance(userId, -amount, trx);
      await this.accountRepository.updateBalance(recipient.id, amount, trx);
    });

    this.logger.info('Transfer completed', { userId, recipientEmail, amount });
  }
}
