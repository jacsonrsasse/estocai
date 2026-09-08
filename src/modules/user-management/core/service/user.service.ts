import { CreateUserResponseDto } from '#modules/user-management/http/dto/create-user-response.dto';
import { CreateUserDto } from '#modules/user-management/http/dto/create-user.dto';
import { PrismaService } from '#shared-modules/persistence/prisma/prisma.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v7 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUser: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      const user = await this.prismaService.user.create({
        data: {
          ...createUser,
          userId: uuid(),
        },
      });
      return {
        userId: user.userId,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
