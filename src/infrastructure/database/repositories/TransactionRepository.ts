import {
  ITransactionRepository,
  ListTransactionsFilters,
  TransactionListItem,
} from '@domain/interfaces/ITransactionRepository';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionMapper } from '@infrastructure/mappers/TransactionMapper';
import { TransactionType } from '@domain/enums/TransactionType';
import { Knex } from 'knex';
import { v7 as uuidv7 } from 'uuid';

interface TransactionListRow {
  id: string;
  type: TransactionType;
  amount: number;
  sender_id: string;
  sender_name: string;
  recipient_id: string | null;
  recipient_name: string | null;
  created_at: Date;
}

export class TransactionRepository implements ITransactionRepository {
  constructor(private db: Knex) {}

  async create(transaction: Transaction, trx: Knex.Transaction): Promise<string> {
    const id = uuidv7();
    await trx('transactions').insert(TransactionMapper.toPersistence(transaction, id));
    return id;
  }

  async listByUser(
    userId: string,
    filters: ListTransactionsFilters,
  ): Promise<TransactionListItem[]> {
    const query = this.db('transactions as t')
      .join('users as sender', 'sender.id', 't.user_id')
      .leftJoin('users as recipient', 'recipient.id', 't.recipient_id')
      .select(
        't.id',
        't.type',
        't.amount',
        't.user_id as sender_id',
        'sender.name as sender_name',
        't.recipient_id',
        't.created_at',
        'recipient.name as recipient_name',
      )
      .where((builder) => builder.where('t.user_id', userId).orWhere('t.recipient_id', userId));

    if (filters.type) query.where('t.type', filters.type);
    if (filters.from) query.where('t.created_at', '>=', filters.from);
    if (filters.to) query.where('t.created_at', '<=', filters.to);

    const rows = await query.orderBy('t.created_at', 'desc');

    return (rows as TransactionListRow[]).map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      senderId: row.sender_id,
      senderName: row.sender_name,
      recipientId: row.recipient_id ?? null,
      recipientName: row.recipient_name ?? null,
      createdAt: new Date(row.created_at),
    }));
  }
}
