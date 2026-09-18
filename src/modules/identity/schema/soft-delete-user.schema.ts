import { userSchema } from '#modules/identity/schema/create-user.schema';

export const softDeleteUserParamsSchema = userSchema.pick({ userId: true });
