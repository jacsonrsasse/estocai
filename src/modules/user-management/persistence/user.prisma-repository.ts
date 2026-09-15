import { UserModel, UserStatus } from '#modules/user-management/core/model/user.model';
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

  async findById(userId: string): Promise<UserModel | null> {
    try {
      const user = await this.model.findUnique({ where: { userId } });
      if (!user) {
        return null;
      }
      return UserModel.restore({
        ...user,
        status: UserStatusMapper.toDomain[user.status],
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  async softDelete(userId: string): Promise<void> {
    try {
      await this.model.update({
        where: { userId },
        data: {
          status: UserStatusMapper.toPrisma[UserStatus.deleted],
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }
}
