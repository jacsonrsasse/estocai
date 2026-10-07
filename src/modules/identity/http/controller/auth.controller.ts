import { LoginUseCase } from '#modules/identity/core/use-case/login.use-case';
import { LoginResponseDto } from '#modules/identity/http/dto/login-response.dto';
import { LoginDto } from '#modules/identity/http/dto/login.dto';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('/login')
  @ApiOperation({ summary: 'Authenticates a user and returns an access token' })
  @ZodResponse({ type: LoginResponseDto, status: HttpStatus.OK })
  async login(@Body() login: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(login);
  }
}
