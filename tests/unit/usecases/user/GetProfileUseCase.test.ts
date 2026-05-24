import { describe, it, expect, vi } from 'vitest';
import { GetProfileUseCase } from '@application/usecases/user/GetProfileUseCase';
import { AppError } from '@domain/errors/AppError';
import { makeUserRepository, makeLogger, makeUser } from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const logger = makeLogger();

  const sut = new GetProfileUseCase(userRepository, logger);

  return { sut, userRepository, logger };
};

describe('GetProfileUseCase', () => {
  const userId = 'user-id';

  it('should throw if user is not found', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(sut.execute({ userId })).rejects.toThrow(new AppError('User not found', 404));
  });

  it('should return the user profile', async () => {
    const { sut, userRepository } = makeSut();
    const user = makeUser();
    vi.mocked(userRepository.findById).mockResolvedValue(user);

    const result = await sut.execute({ userId });

    expect(result).toEqual({
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  });
});
