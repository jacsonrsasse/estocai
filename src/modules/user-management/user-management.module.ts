import { UserService } from '#modules/user-management/core/service/user.service';
import { UserController } from '#modules/user-management/http/controller/user.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserManagementModule {}
