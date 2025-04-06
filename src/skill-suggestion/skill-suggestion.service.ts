import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuggestSkillDto } from './dto/skill-sugges.dto';
import { SkillSuggestion } from './entities/skill-suggestion.entity';

@Injectable()
export class SkillSuggestionService {
  constructor(
    @InjectRepository(SkillSuggestion)
    private readonly skillSuggestionRepository: Repository<SkillSuggestion>,
  ) {}

  async create(suggestSkillDto: SuggestSkillDto): Promise<SkillSuggestion> {
    const newSuggestion =
      this.skillSuggestionRepository.create(suggestSkillDto);
    return this.skillSuggestionRepository.save(newSuggestion);
  }

  // Boshqa metodlar (masalan, takliflarni olish, tasdiqlash, rad etish) keyinchalik qo'shilishi mumkin
}
