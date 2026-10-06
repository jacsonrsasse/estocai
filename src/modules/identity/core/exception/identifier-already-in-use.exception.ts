import { LoginTypeWithPassword } from '#modules/identity/core/model/user-identifier.model';
import { ApplicationException } from '#shared-libs/exception/application.exception';
import { HttpStatus } from '@nestjs/common';

const CODE_BY_LOGIN_TYPE: Record<LoginTypeWithPassword, string> = {
  [LoginTypeWithPassword.email]: 'email_already_in_use',
  [LoginTypeWithPassword.username]: 'username_already_in_use',
};

const MESSAGE_BY_LOGIN_TYPE: Record<LoginTypeWithPassword, string> = {
  [LoginTypeWithPassword.email]:
    'An account already exists with this email. Sign in using your existing method.',
  [LoginTypeWithPassword.username]:
    'An account already exists with this username. Sign in using your existing method.',
};

export class IdentifierAlreadyInUseException extends ApplicationException {
  constructor(loginType: LoginTypeWithPassword) {
    super(
      MESSAGE_BY_LOGIN_TYPE[loginType],
      CODE_BY_LOGIN_TYPE[loginType],
      HttpStatus.BAD_REQUEST,
    );
  }
}
