import { ITransactionRepository, ListTransactionsFilters } from '@domain/interfaces/ITransactionRepository';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionMapper } from '@infrastructure/mappers/TransactionMapper';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

export class TransactionRepository implements ITransactionRepository {
  constructor(private db: Knex) {}

  async create(transaction: Transaction, trx: Knex.Transaction): Promise<string> {
    const id = randomUUID();
    await trx('transactions').insert(TransactionMapper.toPersistence(transaction, id));
    return id;
  }

  async listByUser(userId: string, filters: ListTransactionsFilters): Promise<Transaction[]> {
    const query = this.db('transactions').where({ user_id: userId });

    if (filters.type) {
      query.where({ type: filters.type });
    }

    if (filters.from) {
      query.where('created_at', '>=', filters.from);
    }

    if (filters.to) {
      query.where('created_at', '<=', filters.to);
    }

    const rows = await query.orderBy('created_at', 'desc');

    return rows.map(TransactionMapper.fromPersistence);
  }
}
