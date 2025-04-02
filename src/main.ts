import { NestFactory } from '@nestjs/core';
import { Express } from 'express';
import { AppModule } from './app.module';

export default async (): Promise<Express> => {
  const app = await NestFactory.create(AppModule);
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
};
