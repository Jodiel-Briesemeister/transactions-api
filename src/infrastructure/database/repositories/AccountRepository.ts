import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { Account } from '@domain/entities/Account';
import { AccountMapper } from '@infrastructure/mappers/AccountMapper';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

export class AccountRepository implements IAccountRepository {
  constructor(private db: Knex) {}

  async create(userId: string, trx: Knex.Transaction): Promise<void> {
    const account = Account.create({ userId, balance: 0 });
    const id = randomUUID();
    await trx('accounts').insert(AccountMapper.toPersistence(account, id));
  }

  async findByUserId(userId: string, trx?: Knex.Transaction): Promise<Account | null> {
    const query = trx ? trx('accounts') : this.db('accounts');
    const row = await query.where({ user_id: userId }).first();
    return row ? AccountMapper.fromPersistence(row) : null;
  }

  async updateBalance(userId: string, amount: number, trx: Knex.Transaction): Promise<void> {
    await trx('accounts')
      .where({ user_id: userId })
      .increment('balance', amount);
  }
}
