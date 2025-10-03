import { NestFactory } from '@nestjs/core';
import { AppSimpleModule } from './app-simple.module';

async function bootstrap() {
  const app = await NestFactory.create(AppSimpleModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}

bootstrap().catch(console.error);