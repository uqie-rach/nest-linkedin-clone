import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Bind ValidationPipe to the app
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
