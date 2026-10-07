import { preRegisterUserSchema } from '#modules/identity/schema/pre-register-user.schema';
import { createZodDto } from 'nestjs-zod';

export class PreRegisterUserDto extends createZodDto(preRegisterUserSchema) {}
