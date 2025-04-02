import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    try {
      // Код, который может вызвать ошибку
      return 'Hello World!';
    } catch (error) {
      console.error('Ошибка в getHello:', error); // Логирование ошибки
      throw error; // Переброс ошибки для обработки NestJS
    }
  }
}
