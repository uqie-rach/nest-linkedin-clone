import { forwardRef, Module } from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ApiGatewayModule } from '../api-gateway.module';

@Module({
  imports: [
    forwardRef(() => ApiGatewayModule)
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
