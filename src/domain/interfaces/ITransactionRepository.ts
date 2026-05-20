import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';

export type ListTransactionsFilters = {
  type?: TransactionType;
  from?: Date;
  to?: Date;
};

export interface ITransactionRepository {
  create(transaction: Transaction, trx: unknown): Promise<string>;
  listByUser(userId: string, filters: ListTransactionsFilters): Promise<Transaction[]>;
}
