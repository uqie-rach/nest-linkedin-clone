import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ObjectId } from 'typeorm';

import { UsersService } from './users.service';
import { CreateUserDto, FindOneDto, LoginDto, UpdateUserDto } from '../../../contracts/dto/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.validate')
  async validateUser(@Payload() id: string) {
    return this.usersService.validate(id);
  }

  @MessagePattern('users.register')
  async register(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @MessagePattern('users.login')
  async login(@Payload() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @MessagePattern('users.findAll')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('users.findOne')
  findOne(@Payload() query: FindOneDto) {
    console.log('[findOne] query', query);
    return this.usersService.findOne(query);
  }

  @MessagePattern('users.create')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('users.update')
  update(@Payload() updateUserDto: UpdateUserDto) {

    const { id, ...rest } = updateUserDto;
    return this.usersService.update(id, rest);
  }

  @MessagePattern('users.remove')
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }
}
