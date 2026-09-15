import { EnvModule } from '#shared-modules/env/env.module';
import { PrismaModule } from '#shared-modules/persistence/prisma/prisma.module';
import { ModuleMetadata } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

const commonImports: ModuleMetadata['imports'] = [
  EnvModule.forRoot(),
  PrismaModule,
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
  await app.init();

  return { module, app };
};
