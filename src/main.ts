/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { Express } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('NestJS Authentication API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Static file serving for uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        [
          'https://it-experts-one.vercel.app',
          'http://localhost:3000',
          'http://localhost:3030',
        ].includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // 🔥 This is important!
  });

  // Serverless check
  if (!process.env.IS_SERVERLESS) {
    await app.listen(3030);
  }
}

// Nest server creation for serverless environment
export const createNestServer = async (): Promise<Express> => {
  const app = await NestFactory.create(AppModule);
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
};

bootstrap();
