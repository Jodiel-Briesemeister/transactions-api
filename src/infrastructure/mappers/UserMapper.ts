import { User } from '@domain/entities/User';
import { UpdateUserData } from '@domain/interfaces/IUserRepository';

export class UserMapper {
  static toPersistence(user: User, id: string) {
    return {
      id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      phone: user.phone,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  static fromPersistence(row: any): User {
    return User.reconstitute({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      phone: row.phone ?? null,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toUpdatePersistence(data: UpdateUserData) {
    return {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
    };
  }
}
