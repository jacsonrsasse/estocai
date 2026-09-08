import { createUserResponseSchema } from '#modules/user-management/schema/create-user.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserResponseDto extends createZodDto(
  createUserResponseSchema,
) {}
