import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { RpcException } from '@nestjs/microservices';

import { Post } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto } from 'contracts/dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const { userId, tag } = createPostDto;

    console.log('[PostsService] tag:', tag);

    // Ensure tag contains valid ObjectIds
    // if (tag && !tag.every((id) => ObjectId.isValid(id))) {
    //   throw new Error('Invalid ObjectId in tag array');
    // }

    const post = this.postRepository.create({
      ...createPostDto,
      userId: new ObjectId(userId),
      tag,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.postRepository.save(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const updatedData = {
      ...updatePostDto,
      tag: updatePostDto.tag?.map((name) => name),
    };

    await this.postRepository.update(id, updatedData);
    return { message: 'Post updated successfully' };
  }

  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: string) {
    const posts = await this.postRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });

    if (!posts) {
      throw new RpcException(new NotFoundException('Post not found'));
    }

    return posts;
  }

  async remove(id: string) {
    const post = await this.postRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.delete(id);    
    return { message: 'Post deleted successfully' };
  }
}
