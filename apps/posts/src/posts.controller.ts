// apps/posts/src/posts.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PostsService } from './posts.service';
import { AddCommentDto, CreatePostDto, UpdatePostDto } from 'contracts/dto/post.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.addComment')
  addComment(@Payload() { postId, commentId }: AddCommentDto) {
    return this.postsService.addComment(postId, commentId);
  }

  @MessagePattern('posts.removeComment')
  removeComment(@Payload() { postId, commentId }: AddCommentDto) {
    return this.postsService.removeComment(postId, commentId);
  }

  @MessagePattern('posts.create')
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @MessagePattern('posts.findAll')
  findAll() {
    return this.postsService.findAll();
  }

  @MessagePattern('posts.findOne')
  findOne(@Payload() id: string) {
    return this.postsService.findOne(id);
  }

  @MessagePattern('posts.update')
  update(@Payload() { id, ...updatePostDto }: UpdatePostDto & { id: string }) {
    return this.postsService.update(id, updatePostDto);
  }

  @MessagePattern('posts.remove')
  remove(@Payload() id: string) {
    return this.postsService.remove(id);
  }
}
