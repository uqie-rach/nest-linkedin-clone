import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { PostsService } from './posts.service';
import { ApiGatewayModule } from '../api-gateway.module';

@Module({
  imports: [ 
    forwardRef(() => ApiGatewayModule)
  ],
  providers: [PostsService],
  exports: [ClientsModule]
})
export class PostsModule {}
