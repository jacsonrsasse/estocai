import { LoginTypeWithPassword } from '#modules/identity/core/model/user-identifier.model';
import { z } from 'zod';

export const loginSchema = z
  .object({
    loginType: z.enum(LoginTypeWithPassword),
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.loginType === LoginTypeWithPassword.email && !data.email) {
      ctx.addIssue({
        code: 'custom',
        message: 'email is required when loginType is email',
        path: ['email'],
      });
    }

    if (data.loginType === LoginTypeWithPassword.username && !data.username) {
      ctx.addIssue({
        code: 'custom',
        message: 'username is required when loginType is username',
        path: ['username'],
      });
    }
  });

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});
