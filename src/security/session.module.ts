import { Module } from '@nestjs/common';
import { SessionController } from './../mentors/session.controller';
import { SessionService } from './../mentors/session.service';
//
@Module({
  imports: [],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
