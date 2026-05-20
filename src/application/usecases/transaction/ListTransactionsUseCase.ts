import { ITransactionRepository, ListTransactionsFilters } from '@domain/interfaces/ITransactionRepository';
import { ILogger } from '@domain/interfaces/ILogger';

interface Request {
  userId: string;
  filters: ListTransactionsFilters;
}

export class ListTransactionsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private logger: ILogger,
  ) {}

  async execute({ userId, filters }: Request) {
    const transactions = await this.transactionRepository.listByUser(userId, filters);

    this.logger.info('Transactions listed', { userId });

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      recipientId: t.recipientId,
      createdAt: t.createdAt,
    }));
  }
}
