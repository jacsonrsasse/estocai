import { z } from 'zod';

const appSchema = z.object({
  port: z.coerce.number(),
});

const databaseSchema = z.object({
  url: z.string(),
});

const securitySchema = z.object({
  passwordPepper: z.string(),
  jwtSecret: z.string(),
  jwtExpiresInSeconds: z.coerce.number().default(3600),
});

export const envSchema = z.object({
  app: appSchema,
  database: databaseSchema,
  security: securitySchema,
});
