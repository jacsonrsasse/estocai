import {
  LoginTypeWithPassword,
  UserIdentifierModel,
} from '#modules/identity/core/model/user-identifier.model';
import { LoginTypeWithPasswordMapper } from '#modules/identity/persistence/login-type-with-password.mapper';
import { Prisma } from '#prisma/client';
import { PrismaDefaultRepository } from '#shared-modules/persistence/prisma/prisma-default.repository';
import { PrismaService } from '#shared-modules/persistence/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserIdentifierRepository extends PrismaDefaultRepository {
  private readonly model: PrismaService['userIdentifier'];

  constructor(private readonly prismaService: PrismaService) {
    super();
    this.model = prismaService.userIdentifier;
  }

  async create(identifier: UserIdentifierModel, tx?: Prisma.TransactionClient) {
    try {
      await (tx?.userIdentifier ?? this.model).create({
        data: {
          ...identifier,
          type: LoginTypeWithPasswordMapper.toPrisma[identifier.type],
        },
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  async findByTypeAndIdentifier(
    type: LoginTypeWithPassword,
    identifier: string,
    tx?: Prisma.TransactionClient,
  ): Promise<UserIdentifierModel | null> {
    try {
      const found = await (tx?.userIdentifier ?? this.model).findUnique({
        where: {
          user_type_identifier: {
            type: LoginTypeWithPasswordMapper.toPrisma[type],
            identifier,
          },
        },
      });
      if (!found) {
        return null;
      }
      return UserIdentifierModel.restore({
        ...found,
        type: LoginTypeWithPasswordMapper.toDomain[found.type],
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }
}
