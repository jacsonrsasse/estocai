import { IdentityModule } from '#modules/identity/identity.module';
import { EnvModule } from '#shared-modules/env/env.module';
import { PrismaModule } from '#shared-modules/persistence/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule, IdentityModule],
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
