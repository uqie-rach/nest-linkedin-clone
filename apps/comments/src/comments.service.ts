import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { RpcException } from '@nestjs/microservices';

import { Comment } from './entities/comment.entity';
import {
  CreateCommentDto,
  FindAllQueryParamDto,
  RemoveCommentDto,
  UpdateCommentDto,
} from 'contracts/dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(comment: CreateCommentDto): Promise<Comment> {
    const newComment = this.commentRepository.create({
      ...comment,
      user: new ObjectId(comment.user),
      post: new ObjectId(comment.post),
    });
    return await this.commentRepository.save(newComment);
  }

  async update(id: string, comment: UpdateCommentDto): Promise<Comment> {
    await this.commentRepository.update({ _id: new ObjectId(id) }, comment);
    return this.findOne(id);
  }

  async delete(query: RemoveCommentDto) {
    const { post, id } = query;

    console.log(
      '[comments.CommentsService] removeCommentDto:',
      query,
    );

    if (!id && post) {
      console.log('[comments.CommentsService] delete by post');
      await this.commentRepository.delete({ post: new ObjectId(post) });
    } else if (!post && id) {
      console.log('[comments.CommentsService] delete by id');
      await this.commentRepository.delete({ _id: new ObjectId(id) });
    } else { 
      return { message: 'Invalid query' };
    }

    return { message: 'Comment deleted' };
  }

  async findAll(query: FindAllQueryParamDto): Promise<Comment[]> {
    const filters: any = {};

    if (query.post) {
      filters.post = new ObjectId(query.post);
    }

    if (query.user) {
      filters.user = new ObjectId(query.user);
    }

    const comments = await this.commentRepository.find({
      where: filters,
      take: query.limit ?? undefined, // Default to no limit
      order: { createdAt: 'DESC' }, // Example: sorting by newest comments
    });

    return comments;
  }

  async findOne(id: string): Promise<Comment> {
    console.log(id)
    const comment = await this.commentRepository.findOne({
      where: {
        _id: new ObjectId(id),
      }
    });

    console.log(comment)

    if (!comment) {
      throw new RpcException(new NotFoundException('Comment not found'));
    }

    return comment;
  }
}
