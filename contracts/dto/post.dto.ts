// contracts/post.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class PostDto { 
  @IsString()
  _id: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  userId: string;

  @IsArray()
  // tag?: ObjectId[]; // Optional field for tagging users
  tag?: string[]; // Optional field for tagging users

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}

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

export class AddCommentDto {
  @IsString()
  postId: string;

  @IsString()
  commentId: string;
}
