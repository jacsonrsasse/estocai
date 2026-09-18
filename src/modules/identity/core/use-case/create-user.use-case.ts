import { UserModel } from '#modules/identity/core/model/user.model';
import { CreateUserResponseDto } from '#modules/identity/http/dto/create-user-response.dto';
import { CreateUserDto } from '#modules/identity/http/dto/create-user.dto';
import { UserRepository } from '#modules/identity/persistence/user.prisma-repository';
import { UseCase } from '#shared-libs/interfaces/core/use-case.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase implements UseCase<
  CreateUserDto,
  CreateUserResponseDto
> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(data: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = UserModel.create({
      ...data,
    });
    await this.userRepository.create(user);
    return {
      userId: user.userId,
    };
  }
}
