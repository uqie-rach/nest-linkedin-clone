import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreatePostDto, UpdatePostDto } from 'contracts/dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @Inject('POSTS_CLIENT') private postsClient: ClientProxy,
    @Inject('USERS_CLIENT') private usersClient: ClientProxy,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const { userId } = createPostDto;

      const isUserValid = await this.validateUser(userId);

      console.log('[gateway.PostsService] user validation ', isUserValid);

      if (!isUserValid) {
        console.log('[gateway.PostsService] user not found');
        throw new NotFoundException('User not found');
      }

      const response = await firstValueFrom(
        this.postsClient.send('posts.create', createPostDto),
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

  async validateUser(id: string) {
    const isUserExist = await firstValueFrom(
      this.usersClient.send('users.validate', id),
    );

    if (isUserExist) {
      return true;
    }

    return false;
  }

  findAll() {
    return this.postsClient.send('posts.findAll', {});
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.postsClient.send('posts.findOne', id),
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

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const response = await firstValueFrom(
        this.postsClient.send('posts.update', { id, ...updatePostDto }),
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

  async remove(id: string) {
    try {
      const response = await firstValueFrom(
        this.postsClient.send('posts.remove', id),
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
