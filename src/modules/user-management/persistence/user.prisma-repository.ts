import { UserModel } from '#modules/user-management/core/model/user.model';
import { UserStatusMapper } from '#modules/user-management/persistence/user-status.mapper';
import { PrismaDefaultRepository } from '#shared-modules/persistence/prisma/prisma-default.repository';
import { PrismaService } from '#shared-modules/persistence/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends PrismaDefaultRepository {
  private readonly model: PrismaService['user'];

  constructor(private readonly prismaService: PrismaService) {
    super();
    this.model = prismaService.user;
  }

  async create(user: UserModel) {
    try {
      await this.model.create({
        data: {
          ...user,
          status: UserStatusMapper.toPrisma[user.status],
        },
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }
}
