import { z } from 'zod';

export const userSchema = z.object({
  userId: z.uuid(),
  firstName: z.string().min(3),
  lastName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deleted']),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export const createUserSchema = userSchema.pick({
  firstName: true,
  lastName: true,
});

export const createUserResponseSchema = userSchema.pick({ userId: true });
