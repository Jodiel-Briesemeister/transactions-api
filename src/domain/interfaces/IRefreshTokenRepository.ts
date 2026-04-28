export interface CreateRefreshTokenInput {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<void>;

  findByToken(token: string): Promise<RefreshTokenData | null>;

  deleteByToken(token: string): Promise<void>;

  deleteAllByUser(userId: string): Promise<void>;

  deleteExpired(): Promise<void>;
}
