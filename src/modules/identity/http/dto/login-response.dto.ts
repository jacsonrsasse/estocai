import { loginResponseSchema } from '#modules/identity/schema/login.schema';
import { createZodDto } from 'nestjs-zod';

export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
