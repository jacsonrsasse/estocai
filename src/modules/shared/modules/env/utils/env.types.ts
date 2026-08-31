import { envSchema } from '#shared-modules/env/utils/env.schema';
import { z } from 'zod';

export type Env = z.infer<typeof envSchema>;
