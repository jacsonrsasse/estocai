import { CreateUserUseCase } from '#modules/user-management/core/use-case/create-user.use-case';
import { SoftDeleteUserUseCase } from '#modules/user-management/core/use-case/soft-delete-user.use-case';
import { CreateUserResponseDto } from '#modules/user-management/http/dto/create-user-response.dto';
import { CreateUserDto } from '#modules/user-management/http/dto/create-user.dto';
import { SoftDeleteUserParamsDto } from '#modules/user-management/http/dto/soft-delete-user-params.dto';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(
    private readonly createUserUserCase: CreateUserUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Creates a new user' })
  @ZodResponse({ type: CreateUserResponseDto, status: HttpStatus.OK })
  async create(
    @Body() createUser: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.createUserUserCase.execute(createUser);
  }

  @Delete('/:userId')
  @ApiOperation({ summary: 'Soft deletes a user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: SoftDeleteUserParamsDto): Promise<void> {
    return this.softDeleteUserUseCase.execute(params);
  }
}
