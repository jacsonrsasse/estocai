import { softDeleteUserParamsSchema } from '#modules/identity/schema/soft-delete-user.schema';
import { createZodDto } from 'nestjs-zod';

export class SoftDeleteUserParamsDto extends createZodDto(
  softDeleteUserParamsSchema,
) {}
