export interface ICacheService {
  get(namespace: string, key: string): Promise<string | null>;
  set(namespace: string, key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(namespace: string, key: string): Promise<void>;
}
