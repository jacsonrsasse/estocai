import { IdentifierAlreadyInUseException } from '#modules/identity/core/exception/identifier-already-in-use.exception';
import { LoginTypeWithPassword } from '#modules/identity/core/model/user-identifier.model';
import { UserIdentifierRepository } from '#modules/identity/persistence/user-identifier.prisma-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IdentifierAvailabilityService {
  constructor(
    private readonly userIdentifierRepository: UserIdentifierRepository,
  ) {}

  async checkAvailable(
    loginType: LoginTypeWithPassword,
    identifier: string,
  ): Promise<void> {
    const existing =
      await this.userIdentifierRepository.findByTypeAndIdentifier(
        loginType,
        identifier,
      );
    if (existing) {
      throw new IdentifierAlreadyInUseException(loginType);
    }
  }
}
