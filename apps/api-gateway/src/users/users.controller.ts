import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto, FindOneDto, UpdateUserDto } from 'contracts/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('auth/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.usersService.login(email, password);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param() params: FindOneDto) {
    return this.usersService.findOne(params.id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }
  
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.update(id, user);
  }
  
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
