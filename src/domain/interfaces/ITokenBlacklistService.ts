export interface ITokenBlacklistService {
  add(token: string, ttlSeconds: number): Promise<void>;
  has(token: string): Promise<boolean>;
}
