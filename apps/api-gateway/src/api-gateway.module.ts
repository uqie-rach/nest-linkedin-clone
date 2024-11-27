import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';

import { ApiGatewayController } from './api-gateway.controller';
import { UsersController } from './users/users.controller';

import { ApiGatewayService } from './api-gateway.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [UsersModule],
  controllers: [ApiGatewayController, UsersController],
  providers: [ApiGatewayService, UsersService],
})
export class ApiGatewayModule {}
