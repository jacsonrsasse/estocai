import { PasswordCredentialModel } from '#modules/identity/core/model/password-credential.model';
import {
  LoginTypeWithPassword,
  UserIdentifierModel,
} from '#modules/identity/core/model/user-identifier.model';
import { UserModel } from '#modules/identity/core/model/user.model';
import { IdentifierAvailabilityService } from '#modules/identity/core/service/identifier-availability.service';
import { generateTemporaryPassword } from '#modules/identity/core/util/generate-temporary-password.util';
import { CreateUserResponseDto } from '#modules/identity/http/dto/create-user-response.dto';
import { CreateUserDto } from '#modules/identity/http/dto/create-user.dto';
import { PasswordCredentialRepository } from '#modules/identity/persistence/password-credential.prisma-repository';
import { UserIdentifierRepository } from '#modules/identity/persistence/user-identifier.prisma-repository';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';
import { PrismaService } from '#shared-modules/persistence/prisma/prisma.service';
import { UseCase } from '#shared-libs/interfaces/core/use-case.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase implements UseCase<
  CreateUserDto,
  CreateUserResponseDto
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly userIdentifierRepository: UserIdentifierRepository,
    private readonly passwordCredentialRepository: PasswordCredentialRepository,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly identifierAvailabilityService: IdentifierAvailabilityService,
  ) {}

  async execute(data: CreateUserDto): Promise<CreateUserResponseDto> {
    const identifierValue =
      data.loginType === LoginTypeWithPassword.email
        ? data.email!
        : data.username!;

    await this.identifierAvailabilityService.checkAvailable(
      data.loginType,
      identifierValue,
    );

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash =
      await this.passwordHashingService.hash(temporaryPassword);

    const user = UserModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const userIdentifier = UserIdentifierModel.create({
      userId: user.userId,
      type: data.loginType,
      identifier: identifierValue,
    });

    const passwordCredential = PasswordCredentialModel.create({
      userId: user.userId,
      passwordHash,
    });

    await this.prismaService.$transaction(async (tx) => {
      await this.userRepository.create(user, tx);
      await this.userIdentifierRepository.create(userIdentifier, tx);
      await this.passwordCredentialRepository.create(passwordCredential, tx);
    });

    return {
      loginType: data.loginType,
      identity: identifierValue,
      temporaryPassword,
    };
  }
}
