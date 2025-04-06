import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillModule } from '../skill/skill.module'; // SkillService kerak bo'ladi
import { CategoryService } from './../category/category.service';
import { Category } from './../category/entities/category.entity';
import { Question } from './entities/question.entity';
import { QuestionController } from './questions.controller';
import { QuestionService } from './questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Category]), SkillModule],
  providers: [QuestionService, CategoryService],
  controllers: [QuestionController],
})
export class QuestionModule {}
