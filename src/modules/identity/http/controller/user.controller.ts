import { PreRegisterUserUseCase } from '#modules/identity/core/use-case/pre-register-user.use-case';
import { SoftDeleteUserUseCase } from '#modules/identity/core/use-case/soft-delete-user.use-case';
import { PreRegisterUserResponseDto } from '#modules/identity/http/dto/pre-register-user-response.dto';
import { PreRegisterUserDto } from '#modules/identity/http/dto/pre-register-user.dto';
import { SoftDeleteUserParamsDto } from '#modules/identity/http/dto/soft-delete-user-params.dto';
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
    private readonly preRegisterUserUseCase: PreRegisterUserUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
  ) {}

  @Post('/pre-register')
  @ApiOperation({ summary: 'Creates a pre-registered user' })
  @ZodResponse({ type: PreRegisterUserResponseDto, status: HttpStatus.OK })
  async preRegister(
    @Body() preRegisterUser: PreRegisterUserDto,
  ): Promise<PreRegisterUserResponseDto> {
    return this.preRegisterUserUseCase.execute(preRegisterUser);
  }

  @Delete('/:userId')
  @ApiOperation({ summary: 'Soft deletes a user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: SoftDeleteUserParamsDto): Promise<void> {
    return this.softDeleteUserUseCase.execute(params);
  }
}
