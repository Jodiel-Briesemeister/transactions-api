import { describe, it, expect, vi } from 'vitest';
import { LogoutUseCase } from '@application/usecases/auth/LogoutUseCase';
import {
  makeRefreshTokenRepository,
  makeTokenBlacklistService,
  makeAuthService,
} from '../../helpers/mocks';

const makeSut = () => {
  const refreshTokenRepository = makeRefreshTokenRepository();
  const tokenBlacklistService = makeTokenBlacklistService();
  const authService = makeAuthService();

  const sut = new LogoutUseCase(refreshTokenRepository, tokenBlacklistService, authService);

  return { sut, refreshTokenRepository, tokenBlacklistService, authService };
};

describe('LogoutUseCase', () => {
  const refreshToken = 'refresh-token';
  const accessToken = 'access-token';

  it('should delete the refresh token', async () => {
    const { sut, refreshTokenRepository, authService } = makeSut();
    vi.mocked(authService.getTokenExpiresIn).mockReturnValue(0);

    await sut.execute({ refreshToken, accessToken });

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith(refreshToken);
  });

  it('should blacklist the access token when ttl is positive', async () => {
    const { sut, tokenBlacklistService, authService } = makeSut();
    vi.mocked(authService.getTokenExpiresIn).mockReturnValue(300);

    await sut.execute({ refreshToken, accessToken });

    expect(tokenBlacklistService.add).toHaveBeenCalledWith(accessToken, 300);
  });

  it('should not blacklist the access token when ttl is zero', async () => {
    const { sut, tokenBlacklistService, authService } = makeSut();
    vi.mocked(authService.getTokenExpiresIn).mockReturnValue(0);

    await sut.execute({ refreshToken, accessToken });

    expect(tokenBlacklistService.add).not.toHaveBeenCalled();
  });

  it('should not blacklist the access token when ttl is negative', async () => {
    const { sut, tokenBlacklistService, authService } = makeSut();
    vi.mocked(authService.getTokenExpiresIn).mockReturnValue(-1);

    await sut.execute({ refreshToken, accessToken });

    expect(tokenBlacklistService.add).not.toHaveBeenCalled();
  });
});
