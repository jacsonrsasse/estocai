import { UserStatus } from '#modules/user-management/core/model/user.model';

import { UserStatus as UserStatusPrisma } from '#prisma/enums';

export class UserStatusMapper {
  static toPrisma: Record<UserStatus, UserStatusPrisma> = {
    active: 'active',
    inactive: 'inactive',
    deleted: 'deleted',
  };

  static toDomain: Record<UserStatusPrisma, UserStatus> = {
    active: UserStatus.active,
    inactive: UserStatus.inactive,
    deleted: UserStatus.deleted,
  };
}
