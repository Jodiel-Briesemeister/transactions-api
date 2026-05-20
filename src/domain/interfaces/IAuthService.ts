export interface IAuthService {
  generateAccessToken(userId: string): string;
  verifyAccessToken(token: string): { userId: string };
  getTokenExpiresIn(token: string): number;
}
