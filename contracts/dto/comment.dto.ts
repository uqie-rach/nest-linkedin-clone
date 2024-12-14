import { IsNotEmpty, isNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  post: string; // ObjectId dari post

  @IsString()
  @IsNotEmpty()
  user: string; // ObjectId dari user

  @IsString()
  @IsNotEmpty()
  content: string; // Isi komentar

  @IsOptional()
  likes?: string[]; // Array dari ObjectId user yang menyukai komentar

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  post: string; // ObjectId dari post

  @IsString()
  @IsNotEmpty()
  user: string; // ObjectId dari user

  @IsString()
  @IsNotEmpty()
  content: string; // Isi komentar
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsOptional()
  post: string; // ObjectId dari post

  @IsString()
  @IsOptional()
  user: string; // ObjectId dari user

  @IsString()
  @IsNotEmpty()
  content?: string; // Isi komentar (opsional)
}

export class FindOneCommentDto {
  @IsString()
  @IsNotEmpty()
  id: string; // ObjectId dari komentar
}

export class FindAllQueryParamDto {
  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  post?: string;

  @IsString()
  @IsOptional()
  limit?: number;
}

export class RemoveCommentDto { 
  @IsString()
  @IsOptional()
  post: string;

  @IsString()
  @IsOptional()
  id: string;
}

