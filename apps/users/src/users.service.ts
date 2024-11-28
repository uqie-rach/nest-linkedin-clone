import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'contracts/dto/user.dto';
import { Role } from 'contracts/enum/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (isUserExist) {
      throw new RpcException(new ConflictException('User already exists'));
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: Role.User, 
    });
    
    await this.userRepository.save(user);
    
    return { message: 'User created successfully', statusCode: 201, error: false };
  }
  
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    
    if (!user) {
      throw new RpcException(new NotFoundException('User Not Found!'));
    }
    
    const { password: userPassword, ...rest } = user;
    const isPasswordMatch = await bcrypt.compare(password, userPassword);
    
    if (!isPasswordMatch) {
      throw new RpcException(new BadRequestException('Email or Password is incorrect'));
    }

    const token = this.jwtService.sign({ email: user.email, id: user._id, role: user.role });

    return { token, user: rest };
  }
  
  async create(createUserDto: CreateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    console.log(isUserExist);

    if (isUserExist) {
      throw new RpcException(new ConflictException('User already exists'));
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: Role.User, 
    });

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!isUserExist) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    const user = await this.userRepository.update(id, updateUserDto);

    console.log(user);

    return { message: 'User updated successfully', statusCode: 200 };
  }

  async remove(id: string) {
    const isUserExist = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!isUserExist) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    await this.userRepository.delete(id);
    return { message: 'User deleted successfully', statusCode: 200 };
  }
}
