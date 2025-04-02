import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    try {
      const session = this.sessionRepository.create(createSessionDto);
      return await this.sessionRepository.save(session);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating session: ${error}`,
      );
    }
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      return await this.sessionRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching sessions: ${error}`,
      );
    }
  }
}
