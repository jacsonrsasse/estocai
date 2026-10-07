import { ApplicationExceptionFilter } from '#shared-libs/exception/application-exception.filter';
import { AuthModule } from '#shared-modules/auth/auth.module';
import { EnvModule } from '#shared-modules/env/env.module';
import { PasswordHashingModule } from '#shared-modules/password-hashing/password-hashing.module';
import { PrismaModule } from '#shared-modules/persistence/prisma/prisma.module';
import { ModuleMetadata } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

const commonImports: ModuleMetadata['imports'] = [
  EnvModule.forRoot(),
  PrismaModule,
  PasswordHashingModule,
  AuthModule,
];

export const createNestApp = async (
  modules: ModuleMetadata['imports'] = [],
) => {
  const module = await Test.createTestingModule({
    imports: [...commonImports, ...modules],
    providers: [
      { provide: APP_PIPE, useClass: ZodValidationPipe },
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalFilters(new ApplicationExceptionFilter());
  await app.init();

  return { module, app };
};
