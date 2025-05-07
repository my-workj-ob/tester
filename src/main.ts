import { NestFactory } from '@nestjs/core';

import { IoAdapter } from '@nestjs/platform-socket.io';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cors from 'cors';

import express from 'express';

import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.use(
    cors({
      origin: ['https://it-experts-nine.vercel.app', 'http://localhost:3000'],
      credentials: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

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

  await app.listen(process.env.PORT || 3030);
}

bootstrap();
