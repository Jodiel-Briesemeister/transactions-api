import { Knex } from 'knex';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { User } from '@domain/entities/User';
import { UserMapper } from '@infrastructure/mappers/UserMapper';
import { randomUUID } from 'crypto';

export class UserRepository implements IUserRepository {
  constructor(private db: Knex) {}

  async create(user: User): Promise<string> {
    const id = randomUUID();
    const data = UserMapper.toPersistence(user, id);
    await this.db('users').insert(data);
    return id
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db('users').where({ email }).first();

    if (!user) return null;

    return UserMapper.fromPersistence(user);
  }
}
