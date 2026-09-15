import { CreateUserUseCase } from '#modules/user-management/core/use-case/create-user.use-case';
import { SoftDeleteUserUseCase } from '#modules/user-management/core/use-case/soft-delete-user.use-case';
import { UserController } from '#modules/user-management/http/controller/user.controller';
import { UserRepository } from '#modules/user-management/persistence/user.prisma-repository';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [CreateUserUseCase, SoftDeleteUserUseCase, UserRepository],
})
export class UserManagementModule {}
