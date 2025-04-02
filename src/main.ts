/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { Express } from 'express';
import { AppModule } from './app.module';

export default async (): Promise<Express> => {
  const app = await NestFactory.create(AppModule);
  app.get('/test', (req, res) => {
    res.send('Test route works!');
  });
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
};
