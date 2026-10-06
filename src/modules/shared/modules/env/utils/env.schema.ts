import { z } from 'zod';

const appSchema = z.object({
  port: z.coerce.number(),
});

const databaseSchema = z.object({
  url: z.string(),
});

const securitySchema = z.object({
  passwordPepper: z.string(),
});

export const envSchema = z.object({
  app: appSchema,
  database: databaseSchema,
  security: securitySchema,
});
