import { userSchema } from '#modules/user-management/schema/create-user.schema';

export const softDeleteUserParamsSchema = userSchema.pick({ userId: true });
