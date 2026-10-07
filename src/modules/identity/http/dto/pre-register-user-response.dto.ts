import { preRegisterUserResponseSchema } from '#modules/identity/schema/pre-register-user.schema';
import { createZodDto } from 'nestjs-zod';

export class PreRegisterUserResponseDto extends createZodDto(
  preRegisterUserResponseSchema,
) {}
