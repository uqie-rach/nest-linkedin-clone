import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

import { ApiGatewayController } from './api-gateway.controller';
import { UsersController } from './users/users.controller';

import { ApiGatewayService } from './api-gateway.service';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ApiGatewayController, UsersController],
  providers: [
    ApiGatewayService,
    UsersService,
    JwtService,
    ConfigService,
  ],
})
export class ApiGatewayModule {}
