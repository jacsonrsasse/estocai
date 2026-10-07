import { ApplicationException } from '#shared-libs/exception/application.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends ApplicationException {
  constructor() {
    super(
      'Email/usuário ou senha inválidos.',
      'invalid_credentials',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
