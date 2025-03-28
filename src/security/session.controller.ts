import { Body, Controller, Delete, Get, Query } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getSessions(@Query('userId') userId: number) {
    return this.sessionService.getUserSessions(userId);
  }

  @Delete('logout')
  async logoutSession(@Body('sessionId') sessionId: number) {
    return this.sessionService.logoutSession(sessionId);
  }

  @Delete('logout-all')
  async logoutAll(@Body('userId') userId: number) {
    return this.sessionService.logoutAllSessions(userId);
  }
}
