import { IdentifierAvailabilityService } from '#modules/identity/core/service/identifier-availability.service';
import { PreRegisterUserUseCase } from '#modules/identity/core/use-case/pre-register-user.use-case';
import { SoftDeleteUserUseCase } from '#modules/identity/core/use-case/soft-delete-user.use-case';
import { UserController } from '#modules/identity/http/controller/user.controller';
import { PasswordCredentialRepository } from '#modules/identity/persistence/password-credential.prisma-repository';
import { UserIdentifierRepository } from '#modules/identity/persistence/user-identifier.prisma-repository';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [
    PreRegisterUserUseCase,
    SoftDeleteUserUseCase,
    UserRepository,
    UserIdentifierRepository,
    PasswordCredentialRepository,
    IdentifierAvailabilityService,
  ],
})
export class IdentityModule {}
