import { Knex } from 'knex';
import { IUserRepository, UpdateUserData } from '@domain/interfaces/IUserRepository';
import { User } from '@domain/entities/User';
import { UserMapper } from '@infrastructure/mappers/UserMapper';
import { randomUUID } from 'crypto';

export class UserRepository implements IUserRepository {
  constructor(private db: Knex) {}

  async create(user: User, trx?: Knex.Transaction): Promise<string> {
    const id = randomUUID();
    const query = trx ? trx('users') : this.db('users');
    await query.insert(UserMapper.toPersistence(user, id));
    return id
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db('users').where({ email }).first();
    return row ? UserMapper.fromPersistence(row) : null;
  }

  async findById(id: string, trx?: Knex.Transaction): Promise<User | null> {
    const query = trx ? trx('users') : this.db('users');
    const row = await query.where({ id, is_active: true }).first();
    return row ? UserMapper.fromPersistence(row) : null;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const [row] = await this.db('users')
      .where({ id })
      .update(UserMapper.toUpdatePersistence(data))
      .returning('*');

    return UserMapper.fromPersistence(row);
  }

  async deactivate(id: string): Promise<void> {
    await this.db('users')
      .where({ id, is_active: true })
      .update({ is_active: false, updated_at: new Date() });
  }

  async reactivate(id: string): Promise<void> {
    await this.db('users')
      .where({ id, is_active: false })
      .update({ is_active: true, updated_at: new Date() });
  }
}
