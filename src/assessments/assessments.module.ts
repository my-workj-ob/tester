import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentResultController } from './../assessment-result/assessment-result.controller';
import { AssessmentResultModule } from './../assessment-result/assessment-result.module';
import { AssessmentResultService } from './../assessment-result/assessment-result.service';
import { AssessmentResult } from './../assessment-result/entities/assements-result.entity';
import { CategoryModule } from './../category/category.module';
import { Category } from './../category/entities/category.entity';
import { CodingSubmissionModule } from './../coding-submission/coding-submission.module';
import { Question } from './../questions/entities/question.entity';
import { QuestionModule } from './../questions/questions.module';
import { QuestionService } from './../questions/questions.service';
import { Skill } from './../skill/entities/skill.entity';
import { SkillModule } from './../skill/skill.module';
import { SkillService } from './../skill/skill.service';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { AssessmentController } from './assessments.controller';
import { AssessmentService } from './assessments.service';
import { Assessment } from './entities/assessments.entity'; // ✅ import Assessment entity

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      AssessmentResult,
      User,
      Question,
      Skill,
      Category,
    ]),
    forwardRef(() => AssessmentResultModule),
    forwardRef(() => CodingSubmissionModule), // 🛠️ Qo‘shish shart
    SkillModule,
    QuestionModule,
    CategoryModule,
  ],

  providers: [
    AssessmentResultService,
    AssessmentService,
    UserService,
    QuestionService,
    SkillService,
  ],
  controllers: [AssessmentController, AssessmentResultController],
  exports: [AssessmentService, QuestionService],
})
export class AssessmentsModule {}
