import { loginSchema } from '#modules/identity/schema/login.schema';
import { createZodDto } from 'nestjs-zod';

export class LoginDto extends createZodDto(loginSchema) {}
