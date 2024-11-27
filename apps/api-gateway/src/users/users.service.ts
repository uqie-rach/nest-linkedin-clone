import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreateUserDto, UpdateUserDto } from 'contracts/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('USERS_CLIENT') private usersClient: ClientProxy) {}
  
  async create(createUserDto: CreateUserDto) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.create', createUserDto),
      );

      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }
  
  async register(createUserDto: CreateUserDto) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.register', createUserDto),
      );

      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }
  
  async login(email: string, password: string) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.login', { email, password }),
      );

      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  findAll() {
    return this.usersClient.send('users.findAll', {});
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.findOne', id),
      );
      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.update', { id, ...updateUserDto }),
      );

      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async remove(id: string) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send('users.remove', id),
      );

      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }
}
