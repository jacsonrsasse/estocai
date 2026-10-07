import { PasswordCredentialModel } from '#modules/identity/core/model/password-credential.model';
import { Prisma } from '#prisma/client';
import { PrismaDefaultRepository } from '#shared-modules/persistence/prisma/prisma-default.repository';
import { PrismaService } from '#shared-modules/persistence/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordCredentialRepository extends PrismaDefaultRepository {
  private readonly model: PrismaService['passwordCredential'];

  constructor(private readonly prismaService: PrismaService) {
    super();
    this.model = prismaService.passwordCredential;
  }

  async create(
    credential: PasswordCredentialModel,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      await (tx?.passwordCredential ?? this.model).create({
        data: { ...credential },
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PasswordCredentialModel | null> {
    try {
      const found = await (tx?.passwordCredential ?? this.model).findFirst({
        where: { userId },
      });
      if (!found) {
        return null;
      }
      return PasswordCredentialModel.restore(found);
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }
}
