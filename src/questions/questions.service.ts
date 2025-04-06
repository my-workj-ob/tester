import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillService } from '../skill/skill.service';
import { CategoryService } from './../category/category.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly skillService: SkillService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const category = await this.categoryService.findOne(
      createQuestionDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException(
        `Kategoriya ${createQuestionDto.categoryId} topilmadi`,
      );
    }
    const newQuestion = this.questionRepository.create(createQuestionDto);
    return this.questionRepository.save(newQuestion);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['skill', 'category'] }); // Ko'nikma va kategoriya ma'lumotlarini ham olish
  }

  async findByCategoryId(categoryId: number): Promise<Question[]> {
    const category = await this.categoryService.findOne(categoryId);
    if (!category) {
      throw new NotFoundException(`Kategoriya ${categoryId} topilmadi`);
    }
    return this.questionRepository.find({
      where: { category: { id: categoryId } },
      relations: ['skill', 'category'], // Ko'nikma va kategoriya ma'lumotlarini ham olish
    });
  }

  async findBySkillId(skillId: number): Promise<Question[]> {
    return this.questionRepository.find({
      where: { skill: { id: skillId } },
      relations: ['skill', 'category'], // Ko'nikma va kategoriya ma'lumotlarini ham olish
    });
  }

  async search(keyword: string): Promise<Question[]> {
    return (
      this.questionRepository
        .createQueryBuilder('question')
        .leftJoinAndSelect('question.skill', 'skill')
        .leftJoinAndSelect('question.category', 'category')
        .where('LOWER(question.text) LIKE :keyword', {
          keyword: `%${keyword.toLowerCase()}%`,
        })
        .orWhere('LOWER(skill.name) LIKE :keyword', {
          keyword: `%${keyword.toLowerCase()}%`,
        })
        .orWhere('LOWER(category.name) LIKE :keyword', {
          keyword: `%${keyword.toLowerCase()}%`,
        })
        // Agar teglash implementatsiya qilingan bo'lsa, teglarni ham qidiruvga qo'shishingiz mumkin
        .getMany()
    );
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['skill'],
    });

    console.log(question);
    if (!question) {
      throw new NotFoundException(`Savol ${id} topilmadi`);
    }
    return question;
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(id);
    const { skillId, ...questionData } = updateQuestionDto;

    if (skillId !== undefined) {
      const skill = await this.skillService.findOne(skillId);
      if (!skill) {
        throw new BadRequestException(`Ko'nikma ${skillId} topilmadi`);
      }
      question.skill = skill;
      question.skillId = skillId;
    }

    Object.assign(question, questionData);

    return this.questionRepository.save(question);
  }

  async remove(id: number): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepository.remove(question);
  }
}
