import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { SuggestSkillDto } from './dto/skill-sugges.dto';
import { SkillSuggestion } from './entities/skill-suggestion.entity';
import { SkillSuggestionService } from './skill-suggestion.service';

@ApiTags('Skill Suggestions')
@Controller('skill-suggestions')
export class SkillSuggestionController {
  constructor(
    private readonly skillSuggestionService: SkillSuggestionService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: "Ko'nikma taklifi muvaffaqiyatli yuborildi",
    type: SkillSuggestion,
  })
  async suggestSkill(
    @Body() suggestSkillDto: SuggestSkillDto,
  ): Promise<SkillSuggestion> {
    return this.skillSuggestionService.create(suggestSkillDto);
  }
}
