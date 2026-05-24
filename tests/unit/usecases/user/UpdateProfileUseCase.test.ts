import { describe, it, expect, vi } from 'vitest';
import { UpdateProfileUseCase } from '@application/usecases/user/UpdateProfileUseCase';
import { AppError } from '@domain/errors/AppError';
import { makeUserRepository, makeLogger, makeUser } from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const logger = makeLogger();

  const sut = new UpdateProfileUseCase(userRepository, logger);

  return { sut, userRepository, logger };
};

describe('UpdateProfileUseCase', () => {
  const userId = 'user-id';

  it('should throw if user is not found', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(sut.execute({ userId, name: 'New Name' })).rejects.toThrow(
      new AppError('User not found', 404),
    );
  });

  it('should throw if email is already in use by another user', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'other-user-id' }));

    await expect(sut.execute({ userId, email: 'taken@test.com' })).rejects.toThrow(
      new AppError('Email already in use', 409),
    );
  });

  it('should not check email conflict when email is unchanged', async () => {
    const { sut, userRepository } = makeSut();
    const user = makeUser();
    vi.mocked(userRepository.findById).mockResolvedValue(user);
    vi.mocked(userRepository.update).mockResolvedValue(user);

    await sut.execute({ userId, email: user.email });

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should return updated profile', async () => {
    const { sut, userRepository } = makeSut();
    const user = makeUser();
    const updated = makeUser();
    vi.mocked(userRepository.findById).mockResolvedValue(user);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.update).mockResolvedValue(updated);

    const result = await sut.execute({ userId, name: 'New Name', email: 'new@test.com' });

    expect(result).toEqual({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt,
    });
  });
});
