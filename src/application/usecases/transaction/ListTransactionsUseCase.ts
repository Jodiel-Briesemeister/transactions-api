import {
  ITransactionRepository,
  ListTransactionsFilters,
} from '@domain/interfaces/ITransactionRepository';

interface Request {
  userId: string;
  filters: ListTransactionsFilters;
}

export class ListTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ userId, filters }: Request) {
    return this.transactionRepository.listByUser(userId, filters);
  }
}
