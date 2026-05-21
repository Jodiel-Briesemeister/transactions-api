import { Knex } from 'knex';
import {
  CreateRefreshTokenInput,
  IRefreshTokenRepository,
  RefreshTokenData,
} from '@domain/interfaces/IRefreshTokenRepository';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private db: Knex) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async create({
    userId,
    token,
    expiresAt,
  }: CreateRefreshTokenInput): Promise<void> {
    await this.db('refresh_tokens').insert({
      id: uuidv7(),
      user_id: userId,
      token_hash: this.hash(token),
      expires_at: expiresAt,
    });
  }

  async findByToken(token: string): Promise<RefreshTokenData | null> {
    const hash = this.hash(token);

    const row = await this.db('refresh_tokens')
      .where({ token_hash: hash })
      .first();

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: row.expires_at,
    };
  }

  async deleteByToken(token: string) {
    const hash = this.hash(token);

    await this.db('refresh_tokens').where({ token_hash: hash }).delete();
  }

  async deleteAllByUser(userId: string) {
    await this.db('refresh_tokens').where({ user_id: userId }).delete();
  }

  async deleteExpired(): Promise<void> {
    await this.db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }
}
