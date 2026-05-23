import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';

interface TransactionRow {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  recipient_id: string | null;
  created_at: Date;
}

export class TransactionMapper {
  static toPersistence(transaction: Transaction, id: string) {
    return {
      id,
      user_id: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      recipient_id: transaction.recipientId,
      created_at: transaction.createdAt,
    };
  }

  static fromPersistence(row: TransactionRow): Transaction {
    return Transaction.reconstitute({
      id: row.id,
      userId: row.user_id,
      type: row.type as TransactionType,
      amount: row.amount,
      recipientId: row.recipient_id ?? null,
      createdAt: new Date(row.created_at),
    });
  }
}
