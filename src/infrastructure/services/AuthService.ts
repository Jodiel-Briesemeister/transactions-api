import jwt, { JwtPayload } from 'jsonwebtoken';
import { AccessTokenPayload, IAuthService } from '@domain/interfaces/IAuthService';
import { randomUUID } from 'crypto';

export class AuthService implements IAuthService {
  constructor(private readonly jwtSecret: string) {}

  generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, {
      expiresIn: '15m',
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
  }
}
