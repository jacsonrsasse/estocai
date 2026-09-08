import { UserManagementModule } from '#modules/user-management/user-management.module';
import { EnvModule } from '#shared-modules/env/env.module';
import { PrismaModule } from '#shared-modules/persistence/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule, UserManagementModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
