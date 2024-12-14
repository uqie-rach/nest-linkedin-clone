import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  FindAllQueryParamDto,
  RemoveCommentDto,
  UpdateCommentDto,
} from 'contracts/dto/comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('comments.create')
  create(@Payload() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @MessagePattern('comments.update')
  update(@Payload() updateCommentDto: UpdateCommentDto) {
    const { id, ...rest } = updateCommentDto;
    return this.commentsService.update(id, rest);
  }

  @MessagePattern('comments.remove')
  remove(@Payload() removeCommentDto: RemoveCommentDto) {
    return this.commentsService.delete(removeCommentDto);
  }

  @MessagePattern('comments.findAll')
  findAll(@Payload() query: FindAllQueryParamDto) {
    return this.commentsService.findAll(query);
  }

  @MessagePattern('comments.findOne')
  findOne(@Payload() id: string) {
    return this.commentsService.findOne(id);
  }
}
