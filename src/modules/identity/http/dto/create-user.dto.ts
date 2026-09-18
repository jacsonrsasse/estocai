import { createUserSchema } from '#modules/identity/schema/create-user.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(createUserSchema) {}
