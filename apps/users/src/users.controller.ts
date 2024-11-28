import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ObjectId } from 'typeorm';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from 'contracts/dto/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @MessagePattern('users.register')
  async register(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @MessagePattern('users.login')
  async login(@Payload() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.usersService.login(email, password);
  }

  @MessagePattern('users.findAll')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('users.findOne')
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
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
