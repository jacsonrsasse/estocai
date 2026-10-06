import { WithOptional } from '#shared-libs/generics/with-optional';
import { v7 as uuid } from 'uuid';

export enum LoginTypeWithPassword {
  email = 'email',
  username = 'username',
}

export class UserIdentifierModel {
  userIdentifierId: string;
  userId: string;
  type: LoginTypeWithPassword;
  identifier: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(userIdentifierProps: UserIdentifierModel) {
    Object.assign(this, userIdentifierProps);
  }

  static create(
    data: WithOptional<
      UserIdentifierModel,
      'userIdentifierId' | 'createdAt' | 'updatedAt'
    >,
  ) {
    return new UserIdentifierModel({
      ...data,
      userIdentifierId: data.userIdentifierId || uuid(),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
  }

  static restore(data: UserIdentifierModel) {
    return new UserIdentifierModel(data);
  }
}
