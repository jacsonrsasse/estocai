import { LoginTypeWithPassword } from '#modules/identity/core/model/user-identifier.model';
import { z } from 'zod';

export const preRegisterUserSchema = z
  .object({
    loginType: z.enum(LoginTypeWithPassword),
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    firstName: z.string().min(3),
    lastName: z.string().optional(),
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

export const preRegisterUserResponseSchema = z.object({
  loginType: z.enum(LoginTypeWithPassword),
  identity: z.string(),
  temporaryPassword: z.string().length(5),
});
