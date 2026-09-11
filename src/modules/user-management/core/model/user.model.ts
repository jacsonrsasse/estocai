import { WithOptional } from '#shared-libs/generics/with-optional';
import { v7 as uuid } from 'uuid';

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
  deleted = 'deleted',
}

export class UserModel {
  userId: string;
  firstName: string;
  lastName: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  private constructor(userProps: UserModel) {
    Object.assign(this, userProps);
  }

  static create(
    data: WithOptional<
      UserModel,
      'userId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'lastName' | 'status'
    >,
  ) {
    return new UserModel({
      ...data,
      userId: data.userId || uuid(),
      status: data.status || UserStatus.active,
      lastName: data.lastName || null,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt || null,
    });
  }
}
