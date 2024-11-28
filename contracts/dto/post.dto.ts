// contracts/post.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsArray()
  // tag?: ObjectId[]; // Optional field for tagging users
  tag?: string[]; // Optional field for tagging users
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  // tag?: ObjectId[];
  tag?: string[];
}
