import { ITransactionRepository, ListTransactionsFilters, TransactionListItem } from '@domain/interfaces/ITransactionRepository';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionMapper } from '@infrastructure/mappers/TransactionMapper';
import { TransactionType } from '@domain/enums/TransactionType';
import { Knex } from 'knex';
import { v7 as uuidv7 } from 'uuid';

export class TransactionRepository implements ITransactionRepository {
  constructor(private db: Knex) {}

  async create(transaction: Transaction, trx: Knex.Transaction): Promise<string> {
    const id = uuidv7();
    await trx('transactions').insert(TransactionMapper.toPersistence(transaction, id));
    return id;
  }

  async listByUser(userId: string, filters: ListTransactionsFilters): Promise<TransactionListItem[]> {
    const query = this.db('transactions as t')
      .leftJoin('users as u', 'u.id', 't.recipient_id')
      .select('t.id', 't.type', 't.amount', 't.recipient_id', 't.created_at', 'u.name as recipient_name')
      .where('t.user_id', userId);

    if (filters.type) query.where('t.type', filters.type);
    if (filters.from) query.where('t.created_at', '>=', filters.from);
    if (filters.to) query.where('t.created_at', '<=', filters.to);

    const rows = await query.orderBy('t.created_at', 'desc');

    return rows.map((row: any) => ({
      id: row.id,
      type: row.type as TransactionType,
      amount: row.amount,
      recipientId: row.recipient_id ?? null,
      recipientName: row.recipient_name ?? null,
      createdAt: new Date(row.created_at),
    }));
  }
}
