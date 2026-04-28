import { User } from '@domain/entities/User';

export class UserMapper {
  static toPersistence(user: User, id: string) {
    return {
      id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    };
  }

  static fromPersistence(row: any): User {
    return User.reconstitute({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    });
  }
}
