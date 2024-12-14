import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  FindAllQueryParamDto,
  RemoveCommentDto,
  UpdateCommentDto,
} from 'contracts/dto/comment.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from 'contracts/enum/enums';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: FindAllQueryParamDto) {
    return this.commentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(req.user.id, id, updateCommentDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Delete()
  remove(@Request() req: any, @Query() query: RemoveCommentDto) {
    console.log('[comments.CommentsController] removeCommentDto:', query);
    return this.commentsService.remove(req.user.id, query);
  }
}
