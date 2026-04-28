export type AccessTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export interface IAuthService {
  generateAccessToken(userId: string): string;
  verifyAccessToken(token: string): AccessTokenPayload;
}
