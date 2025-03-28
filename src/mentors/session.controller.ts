/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/session.entity';
import { SessionService } from './session.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi sessiya yaratish' })
  createSession(@Body() createSessionDto: CreateSessionDto): Promise<Session> {
    return this.sessionService.createSession(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha sessiyalarni olish' })
  getAllSessions(): Promise<Session[]> {
    return this.sessionService.getAllSessions();
  }
}
