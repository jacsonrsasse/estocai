import { softDeleteUserParamsSchema } from '#modules/user-management/schema/soft-delete-user.schema';
import { createZodDto } from 'nestjs-zod';

export class SoftDeleteUserParamsDto extends createZodDto(
  softDeleteUserParamsSchema,
) {}
