import { userSchema } from '#modules/identity/schema/user.schema';

export const softDeleteUserParamsSchema = userSchema.pick({ userId: true });
