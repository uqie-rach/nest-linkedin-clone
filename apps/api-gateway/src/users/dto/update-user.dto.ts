import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ObjectId } from 'typeorm';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: ObjectId;
}
