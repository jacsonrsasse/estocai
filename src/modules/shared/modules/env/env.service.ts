import { Env } from '#shared-modules/env/utils/env.types';
import { Injectable } from '@nestjs/common';
import { ConfigService, Path, PathValue } from '@nestjs/config';

@Injectable()
export class EnvService<E = Env> extends ConfigService<E, true> {
  override get<P extends Path<E>>(environmentName: P): PathValue<E, P> {
    return super.get(environmentName, { infer: true });
  }
}
