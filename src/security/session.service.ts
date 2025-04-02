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
    try {
      const sessions = await this.sessionRepo.find({
        where: { user: { id: userId } },
      });
      if (!sessions.length) {
        throw new Error('No sessions found for the user');
      }
      return sessions;
    } catch (error) {
      throw new Error(`Error fetching sessions: ${error}`);
    }
  }

  async logoutSession(sessionId: number) {
    try {
      const result = await this.sessionRepo.delete(sessionId);
      if (result.affected === 0) {
        throw new Error('Session not found');
      }
      return { message: 'Session logged out successfully' };
    } catch (error) {
      throw new Error(`Error logging out session: ${error}`);
    }
  }

  async logoutAllSessions(userId: number) {
    try {
      const result = await this.sessionRepo.delete({ user: { id: userId } });
      if (result.affected === 0) {
        throw new Error('No sessions found for the user to log out');
      }
      return { message: 'All sessions logged out successfully' };
    } catch (error) {
      throw new Error(`Error logging out all sessions: ${error}`);
    }
  }
}
