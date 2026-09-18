import { UserStatus } from '#modules/identity/core/model/user.model';
import { SoftDeleteUserParamsDto } from '#modules/identity/http/dto/soft-delete-user-params.dto';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
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
