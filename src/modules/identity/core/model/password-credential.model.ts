import { WithOptional } from '#shared-libs/generics/with-optional';
import { v7 as uuid } from 'uuid';

export class PasswordCredentialModel {
  passwordCredentialId: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(passwordCredentialProps: PasswordCredentialModel) {
    Object.assign(this, passwordCredentialProps);
  }

  static create(
    data: WithOptional<
      PasswordCredentialModel,
      'passwordCredentialId' | 'createdAt' | 'updatedAt'
    >,
  ) {
    return new PasswordCredentialModel({
      ...data,
      passwordCredentialId: data.passwordCredentialId || uuid(),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
  }

  static restore(data: PasswordCredentialModel) {
    return new PasswordCredentialModel(data);
  }
}
