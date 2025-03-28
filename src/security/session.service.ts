import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
  ) {}

  async getUserSessions(userId: number) {
    return this.sessionRepo.find({ where: { user: { id: userId } } });
  }

  async logoutSession(sessionId: number) {
    return this.sessionRepo.delete(sessionId);
  }

  async logoutAllSessions(userId: number) {
    return this.sessionRepo.delete({ user: { id: userId } });
  }
}
