import jwt from 'jsonwebtoken';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { AppError } from '@domain/errors/AppError';
import { env } from '@shared/env';

export class AuthService implements IAuthService {
  constructor(private readonly jwtSecret: string) {}

  generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, {
      expiresIn: env.accessTokenExpiresInSeconds,
    });
  }

  verifyAccessToken(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { sub: string };
      return { userId: payload.sub };
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  getTokenExpiresIn(token: string): number {
    const payload = jwt.decode(token) as { exp: number };
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }
}
