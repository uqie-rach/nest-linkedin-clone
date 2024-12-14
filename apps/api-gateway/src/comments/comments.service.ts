import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateCommentDto,
  FindAllQueryParamDto,
  RemoveCommentDto,
  UpdateCommentDto,
} from 'contracts/dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('COMMENTS_CLIENT') private commentsClient: ClientProxy,
    @Inject('POSTS_CLIENT') private postsClient: ClientProxy,
    @Inject('USERS_CLIENT') private usersClient: ClientProxy,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    try {
      const { user, post } = createCommentDto;

      // Validate user
      const isUserValid = await this.validateUser(user);
      if (!isUserValid) {
        console.log('[gateway.CommentsService] user not found');
        throw new NotFoundException('User not found');
      }

      // Validate post
      const isPostValid = await this.validatePost(post);
      if (!isPostValid) {
        console.log('[gateway.CommentsService] post not found');
        throw new NotFoundException('Post not found');
      }

      // Create comment
      const response = await firstValueFrom(
        this.commentsClient.send('comments.create', createCommentDto),
      );

      // Add comment to post
      const addCommentResponse = await firstValueFrom(
        this.postsClient.send('posts.addComment', {
          postId: post,
          commentId: response._id,
        }),
      );

      console.log(
        '[gateway.CommentsService] addCommentResponse:',
        addCommentResponse,
      );

      return response;
    } catch (error) {
      console.error('[gateway.CommentsService] error', error);

      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async validateUser(userId: string) {
    const isUserExist = await firstValueFrom(
      this.usersClient.send('users.validate', userId),
    );
    return !!isUserExist; // True jika user valid
  }

  async validatePost(postId: string) {
    const isPostExist = await firstValueFrom(
      this.postsClient.send('posts.findOne', postId),
    );
    return !!isPostExist; // True jika post valid
  }

  async findAll(query: FindAllQueryParamDto) {
    try {
      return this.commentsClient.send('comments.findAll', query);
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.commentsClient.send('comments.findOne', id),
      );
      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async update(userId: string, id: string, updateCommentDto: UpdateCommentDto) {
    try {
      const comment = await this.findOne(id);

      if (userId !== comment.user) {
        throw new ForbiddenException(
          'You are not allowed to update this comment',
        );
      }

      const response = await firstValueFrom(
        this.commentsClient.send('comments.update', {
          id,
          ...updateCommentDto,
        }),
      );
      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async remove(userId: string, query: RemoveCommentDto) {
    try {
      const { post, id } = query;

      if (post && id) {
        console.log('[gateway.CommentsService] remove by post and id');
        await firstValueFrom(
          this.postsClient.send('posts.removeComment', {
            postId: post,
            commentId: id,
          }),
        );
      } else if (id) {
        console.log('[gateway.CommentsService] remove by id');
        const comment = await this.findOne(id);
        if (userId !== comment.user) {
          throw new ForbiddenException(
            'You are not allowed to delete this comment',
          );
        }
      }

      const response = await firstValueFrom(
        this.commentsClient.send('comments.remove', query),
      );
      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new HttpException('Internal server error', 500);
    }
  }
}
