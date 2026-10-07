import { InvalidCredentialsException } from '#modules/identity/core/exception/invalid-credentials.exception';
import {
  LoginTypeWithPassword,
  UserIdentifierModel,
} from '#modules/identity/core/model/user-identifier.model';
import { UserModel, UserStatus } from '#modules/identity/core/model/user.model';
import { PasswordCredentialModel } from '#modules/identity/core/model/password-credential.model';
import { LoginUseCase } from '#modules/identity/core/use-case/login.use-case';
import { PasswordCredentialRepository } from '#modules/identity/persistence/password-credential.prisma-repository';
import { UserIdentifierRepository } from '#modules/identity/persistence/user-identifier.prisma-repository';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { AuthService } from '#shared-modules/auth/auth.service';
import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';

describe('LoginUseCase', () => {
  const userId = '01970000-0000-7000-8000-000000000000';

  const buildDeps = () => {
    const userRepository = {
      findById: vi.fn(),
    } as unknown as UserRepository;

    const userIdentifierRepository = {
      findByTypeAndIdentifier: vi.fn(),
    } as unknown as UserIdentifierRepository;

    const passwordCredentialRepository = {
      findByUserId: vi.fn(),
    } as unknown as PasswordCredentialRepository;

    const passwordHashingService = {
      verify: vi.fn(),
    } as unknown as PasswordHashingService;

    const authService = {
      generateAccessToken: vi.fn(),
    } as unknown as AuthService;

    const useCase = new LoginUseCase(
      userRepository,
      userIdentifierRepository,
      passwordCredentialRepository,
      passwordHashingService,
      authService,
    );

    return {
      useCase,
      userRepository,
      userIdentifierRepository,
      passwordCredentialRepository,
      passwordHashingService,
      authService,
    };
  };

  it('throws InvalidCredentialsException when the identifier does not exist', async () => {
    const deps = buildDeps();
    vi.mocked(
      deps.userIdentifierRepository.findByTypeAndIdentifier,
    ).mockResolvedValue(null);

    await expect(
      deps.useCase.execute({
        loginType: LoginTypeWithPassword.email,
        email: 'john.doe@example.com',
        password: 'secret',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('throws InvalidCredentialsException when the user is deleted', async () => {
    const deps = buildDeps();
    const userIdentifier = UserIdentifierModel.create({
      userId,
      type: LoginTypeWithPassword.email,
      identifier: 'john.doe@example.com',
    });
    vi.mocked(
      deps.userIdentifierRepository.findByTypeAndIdentifier,
    ).mockResolvedValue(userIdentifier);
    vi.mocked(deps.userRepository.findById).mockResolvedValue(
      UserModel.restore({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        status: UserStatus.deleted,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      }),
    );

    await expect(
      deps.useCase.execute({
        loginType: LoginTypeWithPassword.email,
        email: 'john.doe@example.com',
        password: 'secret',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('throws InvalidCredentialsException when the password does not match', async () => {
    const deps = buildDeps();
    const userIdentifier = UserIdentifierModel.create({
      userId,
      type: LoginTypeWithPassword.email,
      identifier: 'john.doe@example.com',
    });
    vi.mocked(
      deps.userIdentifierRepository.findByTypeAndIdentifier,
    ).mockResolvedValue(userIdentifier);
    vi.mocked(deps.userRepository.findById).mockResolvedValue(
      UserModel.restore({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        status: UserStatus.preRegistered,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    vi.mocked(deps.passwordCredentialRepository.findByUserId).mockResolvedValue(
      PasswordCredentialModel.restore({
        passwordCredentialId: 'cred-id',
        userId,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    vi.mocked(deps.passwordHashingService.verify).mockResolvedValue(false);

    await expect(
      deps.useCase.execute({
        loginType: LoginTypeWithPassword.email,
        email: 'john.doe@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('returns an access token when credentials are valid', async () => {
    const deps = buildDeps();
    const userIdentifier = UserIdentifierModel.create({
      userId,
      type: LoginTypeWithPassword.email,
      identifier: 'john.doe@example.com',
    });
    vi.mocked(
      deps.userIdentifierRepository.findByTypeAndIdentifier,
    ).mockResolvedValue(userIdentifier);
    vi.mocked(deps.userRepository.findById).mockResolvedValue(
      UserModel.restore({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    vi.mocked(deps.passwordCredentialRepository.findByUserId).mockResolvedValue(
      PasswordCredentialModel.restore({
        passwordCredentialId: 'cred-id',
        userId,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    vi.mocked(deps.passwordHashingService.verify).mockResolvedValue(true);
    vi.mocked(deps.authService.generateAccessToken).mockReturnValue(
      'signed-token',
    );

    const result = await deps.useCase.execute({
      loginType: LoginTypeWithPassword.email,
      email: 'john.doe@example.com',
      password: 'correct-password',
    });

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(deps.authService.generateAccessToken).toHaveBeenCalledWith(userId);
  });
});
