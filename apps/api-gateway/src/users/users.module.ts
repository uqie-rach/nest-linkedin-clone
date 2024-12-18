import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { UsersService } from './users.service';
import { ApiGatewayModule } from '../api-gateway.module';

@Module({
  imports: [
    forwardRef(() => ApiGatewayModule)
  ],
  providers: [UsersService],
  exports: [ClientsModule]
})
export class UsersModule {}
