import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const corsOrigin = configService.get('CORS_ORIGIN');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.includes('.vercel.app') ||
        origin.includes('unio-online.com.br') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('UNIO API')
    .setDescription(
      'Plataforma de Consultas Médicas Online - API Documentation'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('consultations', 'Consultas médicas')
    .addTag('specialties', 'Especialidades médicas')
    .addTag('medical-records', 'Prontuários eletrônicos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(
    `🚀 UNIO API is running on: http://localhost:${port}/${apiPrefix}`
  );
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
