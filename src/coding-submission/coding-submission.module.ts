import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsModule } from './../assessments/assessments.module';
import { Assessment } from './../assessments/entities/assessments.entity';
import { UserModule } from './../user/user.module';
import { CodingSubmissionController } from './coding-submission.controller';
import { CodingSubmissionService } from './coding-submission.service';
import { CodingSubmission } from './entities/coding-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodingSubmission, Assessment]),
    UserModule, // userService uchun
    forwardRef(() => AssessmentsModule), // 🛠️ bu muammoni hal qiladi
  ],
  controllers: [CodingSubmissionController],
  providers: [CodingSubmissionService],
  exports: [CodingSubmissionService],
})
export class CodingSubmissionModule {}
