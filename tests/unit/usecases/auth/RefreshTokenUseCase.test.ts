import { describe, it, expect, vi } from 'vitest';
import { RefreshTokenUseCase } from '@application/usecases/auth/RefreshTokenUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeAuthService,
  makeRefreshTokenService,
  makeRefreshTokenRepository,
} from '../../helpers/mocks';

const makeSut = () => {
  const authService = makeAuthService();
  const refreshTokenRepository = makeRefreshTokenRepository();
  const refreshTokenService = makeRefreshTokenService();
  const logger = makeLogger();

  const sut = new RefreshTokenUseCase(authService, refreshTokenRepository, refreshTokenService, logger);

  return { sut, authService, refreshTokenRepository, refreshTokenService, logger };
};

describe('RefreshTokenUseCase', () => {
  it('should throw if token is not found', async () => {
    const { sut, refreshTokenRepository } = makeSut();
    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue(null);

    await expect(sut.execute({ refreshToken: 'invalid-token' })).rejects.toThrow(
      new AppError('Invalid refresh token', 401),
    );
  });

  it('should throw if token is expired', async () => {
    const { sut, refreshTokenRepository } = makeSut();
    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      expiresAt: new Date('2000-01-01'),
    });

    await expect(sut.execute({ refreshToken: 'expired-token' })).rejects.toThrow(
      new AppError('Expired refresh token', 401),
    );
  });

  it('should delete the old token and return new tokens', async () => {
    const { sut, refreshTokenRepository } = makeSut();
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      expiresAt: futureDate,
    });

    await sut.execute({ refreshToken: 'valid-token' });

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('valid-token');
  });

  it('should return new accessToken and refreshToken on success', async () => {
    const { sut, refreshTokenRepository } = makeSut();
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      expiresAt: futureDate,
    });

    const result = await sut.execute({ refreshToken: 'valid-token' });

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });
});
