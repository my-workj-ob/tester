import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('test')
export class TestController {
  @Get()
  test(@Res() res: Response) {
    res.send('Test route works!');
  }
}
