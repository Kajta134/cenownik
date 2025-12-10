import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

import 'module-alias/register.js';

import { AppModule } from './app.module.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Starting Setup')
    .setDescription('API for Starting Setup application')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Type:', typeof process.env.DATABASE_URL);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  app.useGlobalPipes(new ValidationPipe());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
