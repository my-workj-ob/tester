import { NestFactory } from '@nestjs/core';

import { IoAdapter } from '@nestjs/platform-socket.io';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cors from 'cors';

import express from 'express';

import { join } from 'path';

import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.use(
    cors({
      origin: [
        'https://it-experts-nine.vercel.app',
        'http://192.168.100.26:56515',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 👉 stringlarni avtomatik number, boolean ga o‘giradi
      whitelist: true, // DTO'da bo‘lmagan fieldlar avtomatik olib tashlanadi
      forbidNonWhitelisted: true, // DTO'da yo‘q field bo‘lsa xato beradi
      transformOptions: {
        enableImplicitConversion: true, // DTO'da bo‘lmagan fieldlar avtomatik olib tashlanadi
      },
      skipMissingProperties: false, // DTO'da bo‘lmagan fieldlar avtomatik olib tashlanadi
      stopAtFirstError: false, // DTO'da bo‘lmagan fieldlar avtomatik olib tashlanadi
    }),
  );

  const config = new DocumentBuilder()

    .setTitle('Auth API')

    .setDescription('NestJS Authentication API')

    .setVersion('1.0')

    .addBearerAuth()

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  app.use(
    '/api/docs',

    express.static(join(__dirname, '../node_modules/swagger-ui-dist')),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
