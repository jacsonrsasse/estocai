import { EnvException } from '#shared-modules/env/exception/env.exception';
import { envSchema } from '#shared-modules/env/utils/env.schema';
import { Env } from '#shared-modules/env/utils/env.types';

export const factory = (): Env => {
  const result = envSchema.safeParse({
    app: {
      port: process.env.PORT,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new EnvException('Failed to parse environments');
};
