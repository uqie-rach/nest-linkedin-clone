import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions, BaseRpcExceptionFilter } from '@nestjs/microservices';

import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    },
  );

  // Use global exception filter
  app.useGlobalFilters(new BaseRpcExceptionFilter());
  
  await app.listen();
}
bootstrap();
