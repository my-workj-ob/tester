import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillSuggestion } from './entities/skill-suggestion.entity';
import { SkillSuggestionController } from './skill-suggestion.controller';
import { SkillSuggestionService } from './skill-suggestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkillSuggestion])],
  controllers: [SkillSuggestionController],
  providers: [SkillSuggestionService],
  exports: [SkillSuggestionService],
})
export class SkillSuggestionModule {}
