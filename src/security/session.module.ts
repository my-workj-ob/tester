import { Module } from '@nestjs/common';
import { SessionController } from 'src/mentors/session.controller';
import { SessionService } from 'src/mentors/session.service';
//
@Module({
  imports: [],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
