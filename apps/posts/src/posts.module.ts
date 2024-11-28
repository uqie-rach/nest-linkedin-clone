import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Membuat ConfigModule tersedia di seluruh aplikasi
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI_2'),
        synchronize: true,
        entities: [Post],
      }),
    }),
    TypeOrmModule.forFeature([Post]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
    }),
    PostsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
