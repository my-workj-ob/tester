/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
// s
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, 'https://it-experts-nine.vercel.app'); // Origin bo'lmasa ham, ruxsat berish uchun originni qaytarish
        return;
      }
      const allowedOrigins = [
        'https://it-experts-nine.vercel.app',
        'http://localhost:3000',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, origin); // Agar ruxsat berilgan origin bo'lsa, o'sha originni qaytarish
      } else {
        callback(new Error('Not allowed by CORS')); // Agar ruxsat berilmasa
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204, // Preflight uchun to'g'ri status kodi
  });
  // fix cors
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
