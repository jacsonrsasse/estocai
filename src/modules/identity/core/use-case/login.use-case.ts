import { InvalidCredentialsException } from '#modules/identity/core/exception/invalid-credentials.exception';
import {
  LoginTypeWithPassword,
  UserIdentifierModel,
} from '#modules/identity/core/model/user-identifier.model';
import { UserStatus } from '#modules/identity/core/model/user.model';
import { LoginDto } from '#modules/identity/http/dto/login.dto';
import { LoginResponseDto } from '#modules/identity/http/dto/login-response.dto';
import { PasswordCredentialRepository } from '#modules/identity/persistence/password-credential.prisma-repository';
import { UserIdentifierRepository } from '#modules/identity/persistence/user-identifier.prisma-repository';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { AuthService } from '#shared-modules/auth/auth.service';
import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';
import { UseCase } from '#shared-libs/interfaces/core/use-case.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, LoginResponseDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userIdentifierRepository: UserIdentifierRepository,
    private readonly passwordCredentialRepository: PasswordCredentialRepository,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly authService: AuthService,
  ) {}

  async execute(data: LoginDto): Promise<LoginResponseDto> {
    const identifierValue =
      data.loginType === LoginTypeWithPassword.email
        ? data.email!
        : data.username!;

    const userIdentifier = await this.findUserIdentifier(
      data.loginType,
      identifierValue,
    );

    const user = await this.userRepository.findById(userIdentifier.userId);
    if (!user || user.status === UserStatus.deleted) {
      throw new InvalidCredentialsException();
    }

    const credential = await this.passwordCredentialRepository.findByUserId(
      userIdentifier.userId,
    );
    if (!credential) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.passwordHashingService.verify(
      data.password,
      credential.passwordHash,
    );
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    return {
      accessToken: this.authService.generateAccessToken(user.userId),
    };
  }

  private async findUserIdentifier(
    loginType: LoginTypeWithPassword,
    identifier: string,
  ): Promise<UserIdentifierModel> {
    const userIdentifier =
      await this.userIdentifierRepository.findByTypeAndIdentifier(
        loginType,
        identifier,
      );
    if (!userIdentifier) {
      throw new InvalidCredentialsException();
    }
    return userIdentifier;
  }
}
