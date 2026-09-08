import { EnvService } from '#shared-modules/env/env.service';
import { factory } from '#shared-modules/env/utils/env.factory';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({})
export class EnvModule {
  static forRoot(): DynamicModule {
    return {
      module: EnvModule,
      imports: [
        ConfigModule.forRoot({
          expandVariables: true,
          load: [factory],
        }),
      ],
      providers: [EnvService],
      exports: [EnvService],
      global: true,
    };
  }
}
