export interface IRefreshTokenService {
  createForUser(userId: string): Promise<string>;
}
