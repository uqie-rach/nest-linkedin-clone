import { NestFactory } from '@nestjs/core';
import {
  Transport,
  MicroserviceOptions,
  BaseRpcExceptionFilter,
} from '@nestjs/microservices';

import { PostsModule } from './posts.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PostsModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3002,
      },
    },
  );

  // Use global exception filter
  app.useGlobalFilters(new BaseRpcExceptionFilter());

  await app.listen();
}
bootstrap();
