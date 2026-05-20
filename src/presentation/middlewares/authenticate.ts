import { Request, Response, NextFunction } from 'express';
import { container } from '@shared/container';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { ITokenBlacklistService } from '@domain/interfaces/ITokenBlacklistService';
import { AppError } from '@domain/errors/AppError';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token not provided', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
  	throw new AppError('Token not provided', 401);
  }

  const authService = container.resolve<IAuthService>('authService');
  const tokenBlacklistService = container.resolve<ITokenBlacklistService>('tokenBlacklistService');

  const isBlacklisted = await tokenBlacklistService.has(token);
  if (isBlacklisted) throw new AppError('Token revoked', 401);

  const payload = authService.verifyAccessToken(token);
  req.userId = payload.userId;

  next();
}
