import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';

export type ListTransactionsFilters = {
  type?: TransactionType;
  from?: Date;
  to?: Date;
};

export type TransactionListItem = {
  id: string;
  type: TransactionType;
  amount: number;
  recipientId: string | null;
  recipientName: string | null;
  createdAt: Date;
};

export interface ITransactionRepository {
  create(transaction: Transaction, trx: unknown): Promise<string>;
  listByUser(userId: string, filters: ListTransactionsFilters): Promise<TransactionListItem[]>;
}
