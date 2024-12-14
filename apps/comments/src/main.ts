import { NestFactory } from '@nestjs/core';
import {
  Transport,
  MicroserviceOptions,
  BaseRpcExceptionFilter,
} from '@nestjs/microservices';

import { CommentsModule } from './comments.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommentsModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3003,
      },
    },
  );

  // Use global exception filter
  app.useGlobalFilters(new BaseRpcExceptionFilter());

  await app.listen();
}
bootstrap();
