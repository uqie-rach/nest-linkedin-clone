import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'POSTS_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ApiGatewayController, UsersController, PostsController],
  providers: [
    ApiGatewayService,
    UsersService,
    PostsService,
    JwtService,
    ConfigService,
  ],
  exports: [ClientsModule],
})
export class ApiGatewayModule {}
