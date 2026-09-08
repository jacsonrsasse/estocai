import { createUserSchema } from '#modules/user-management/schema/create-user.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(createUserSchema) {}
