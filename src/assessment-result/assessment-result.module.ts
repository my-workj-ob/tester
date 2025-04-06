import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsModule } from './../assessments/assessments.module';
import { Assessment } from './../assessments/entities/assessments.entity';
import { CodingSubmissionModule } from './../coding-submission/coding-submission.module';
import { UserModule } from './../user/user.module';
import { AssessmentResultController } from './assessment-result.controller';
import { AssessmentResultService } from './assessment-result.service';
import { AssessmentResult } from './entities/assements-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, AssessmentResult]),
    forwardRef(() => AssessmentsModule), // 👈
    UserModule,
    CodingSubmissionModule,
  ],
  controllers: [AssessmentResultController],
  providers: [AssessmentResultService],
  exports: [AssessmentResultService],
})
export class AssessmentResultModule {}
