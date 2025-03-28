import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './entities/mentor.entity';
import { MentorshipRequest } from './entities/mentorship-request.entity';
import { MentorController } from './mentors.controller';
import { MentorService } from './mentors.service';
import { MentorshipRequestService } from './mentorship-requesr.service';
import { MentorshipRequestController } from './mentorship-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor, MentorshipRequest])], // ❗️ `MentorshipRequest` qo'shildi
  controllers: [MentorController, MentorshipRequestController],
  providers: [MentorService, MentorshipRequestService],
  exports: [MentorService],
})
export class MentorsModule {}
