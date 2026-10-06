import { LoginTypeWithPassword } from '#modules/identity/core/model/user-identifier.model';

import { UserIdentifierType as UserIdentifierTypePrisma } from '#prisma/enums';

export class LoginTypeWithPasswordMapper {
  static toPrisma: Record<LoginTypeWithPassword, UserIdentifierTypePrisma> = {
    email: 'email',
    username: 'username',
  };

  static toDomain: Record<UserIdentifierTypePrisma, LoginTypeWithPassword> = {
    email: LoginTypeWithPassword.email,
    username: LoginTypeWithPassword.username,
  };
}
