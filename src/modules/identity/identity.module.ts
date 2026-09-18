import { CreateUserUseCase } from '#modules/identity/core/use-case/create-user.use-case';
import { SoftDeleteUserUseCase } from '#modules/identity/core/use-case/soft-delete-user.use-case';
import { UserController } from '#modules/identity/http/controller/user.controller';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [CreateUserUseCase, SoftDeleteUserUseCase, UserRepository],
})
export class IdentityModule {}
