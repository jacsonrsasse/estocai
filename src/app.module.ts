import { Module } from '@nestjs/common';
import { UserManagementModule } from '@userManagement/user-management.module.js';

@Module({
  imports: [UserManagementModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
