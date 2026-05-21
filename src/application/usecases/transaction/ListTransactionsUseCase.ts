import { ITransactionRepository, ListTransactionsFilters } from '@domain/interfaces/ITransactionRepository';

interface Request {
  userId: string;
  filters: ListTransactionsFilters;
}

export class ListTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ userId, filters }: Request) {
    const transactions = await this.transactionRepository.listByUser(userId, filters);

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      recipientId: t.recipientId,
      createdAt: t.createdAt,
    }));
  }
}
