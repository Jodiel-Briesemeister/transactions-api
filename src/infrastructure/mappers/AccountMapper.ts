import { Account } from '@domain/entities/Account';

interface AccountRow {
  id: string;
  user_id: string;
  balance: number;
  created_at: Date;
}

export class AccountMapper {
  static toPersistence(account: Account, id: string) {
    return {
      id,
      user_id: account.userId,
      balance: account.balance,
      created_at: account.createdAt,
    };
  }

  static fromPersistence(row: AccountRow): Account {
    return Account.reconstitute({
      id: row.id,
      userId: row.user_id,
      balance: row.balance,
      createdAt: new Date(row.created_at),
    });
  }
}
