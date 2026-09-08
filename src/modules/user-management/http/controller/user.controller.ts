import { UserService } from '#modules/user-management/core/service/user.service';
import { CreateUserResponseDto } from '#modules/user-management/http/dto/create-user-response.dto';
import { CreateUserDto } from '#modules/user-management/http/dto/create-user.dto';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/')
  @ApiOperation({ summary: 'Creates a new user' })
  @ZodResponse({ type: CreateUserResponseDto, status: HttpStatus.OK })
  async create(
    @Body() createUser: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.create(createUser);
  }
}
