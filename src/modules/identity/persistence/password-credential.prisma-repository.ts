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
}
