import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ITransactionRepository } from '@domain/interfaces/ITransactionRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';
import { AppError } from '@domain/errors/AppError';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { IMessagePublisher } from '@domain/interfaces/IMessagePublisher';
import { Queue } from '@domain/enums/Queue';
import { NotificationTemplate } from '@domain/enums/NotificationTemplate';

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
    private messagePublisher: IMessagePublisher,
  ) {}

  async execute({ userId, recipientEmail, amount }: Request) {
    if (amount <= 0) throw new AppError('Amount must be greater than zero', 422);

    let recipientName: string;

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
      if (!recipient.isActive) throw new AppError('Recipient account is inactive', 422);
      if (recipient.id === userId) throw new AppError('Cannot transfer to yourself', 422);

      const senderAccount = await this.lockBothAccounts(userId, recipient.id, trx);
      if (senderAccount.balance < amount) throw new AppError('Insufficient balance', 422);

      recipientName = recipient.name;

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

    const sender = await this.userRepository.findById(userId);

    this.messagePublisher.publish(Queue.NotificationsEmail, {
      templateId: NotificationTemplate.TransactionTransferSent,
      userName: sender!.name,
      userEmail: sender!.email,
      recipientName: recipientName!,
      amount,
    });

    this.messagePublisher.publish(Queue.NotificationsEmail, {
      templateId: NotificationTemplate.TransactionTransferReceived,
      userName: recipientName!,
      userEmail: recipientEmail,
      senderName: sender!.name,
      amount,
    });
  }

  /**
   * Takes a write lock on both accounts before the balance is read, so two concurrent transfers
   * cannot both see the same balance and overdraw it. The locks are always acquired in the same id
   * order: the UPDATE statements below take row locks of their own, so A->B and B->A running at
   * once would otherwise each hold the row the other needs and deadlock.
   *
   * @returns the sender account, read under the lock
   */
  private async lockBothAccounts(senderId: string, recipientId: string, trx: unknown) {
    if (senderId < recipientId) {
      const sender = await this.lock(senderId, trx);
      await this.lock(recipientId, trx);
      return sender;
    }

    await this.lock(recipientId, trx);
    return this.lock(senderId, trx);
  }

  private async lock(userId: string, trx: unknown) {
    const account = await this.accountRepository.findByUserIdForUpdate(userId, trx);
    if (!account) {
      this.logger.error('Account not found for existing user', { userId });
      throw new AppError('Account not found', 404);
    }
    return account;
  }
}
