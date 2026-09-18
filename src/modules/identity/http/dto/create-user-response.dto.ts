import { createUserResponseSchema } from '#modules/identity/schema/create-user.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserResponseDto extends createZodDto(
  createUserResponseSchema,
) {}
