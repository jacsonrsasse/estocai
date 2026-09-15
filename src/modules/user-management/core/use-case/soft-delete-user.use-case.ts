import { UserStatus } from '#modules/user-management/core/model/user.model';
import { SoftDeleteUserParamsDto } from '#modules/user-management/http/dto/soft-delete-user-params.dto';
import { UserRepository } from '#modules/user-management/persistence/user.prisma-repository';
import { UseCase } from '#shared-libs/interfaces/core/use-case.interface';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SoftDeleteUserUseCase implements UseCase<
  SoftDeleteUserParamsDto,
  void
> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(data: SoftDeleteUserParamsDto): Promise<void> {
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.deleted) {
      return;
    }

    await this.userRepository.softDelete(user.userId);
  }
}
