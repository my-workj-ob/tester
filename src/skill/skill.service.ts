import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from './../category/category.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @Inject(forwardRef(() => CategoryService)) // ✅ decorator to‘g‘ri ishlatilgan
    private readonly categoryService: CategoryService,
  ) {}

  async create(userId: number, createSkillDto: CreateSkillDto): Promise<Skill> {
    const { categoryId, ...skillData } = createSkillDto;
    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new BadRequestException(`Kategoriya ${categoryId} topilmadi`);
    }
    const skill = this.skillRepository.create({
      ...skillData,
      category,
      userId,
    });
    return this.skillRepository.save(skill);
  }

  async findAllByUserId(userId: number): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { userId },
      relations: ['category', 'user', 'questions'],
    });
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['category', 'user', 'questions'],
    });
    if (!skill) {
      throw new NotFoundException(`Ko'nikma ${id} topilmadi`);
    }
    return skill;
  }
  async getSkillsGroupedByCategory(): Promise<{ [key: string]: Skill[] }> {
    // 1. Barcha skillarni ularning kategoriyalari bilan olish
    const allSkills = await this.skillRepository.find({
      relations: ['category'],
    });

    // 2. Skillarni kategoriyalar bo'yicha guruhlash uchun obyekt yaratish
    const groupedSkills: { [key: string]: Skill[] } = {};

    // 3. Barcha skillarni aylanib chiqib, ularni kategoriyalari bo'yicha guruhlash
    for (const skill of allSkills) {
      if (skill.category && skill.category.name) {
        const categoryName = skill.category.name;
        if (!groupedSkills[categoryName]) {
          groupedSkills[categoryName] = [];
        }
        groupedSkills[categoryName].push(skill);
      } else {
        // Agar skillning kategoriyasi bo'lmasa
        if (!groupedSkills['Uncategorized']) {
          groupedSkills['Uncategorized'] = [];
        }
        groupedSkills['Uncategorized'].push(skill);
      }
    }

    return groupedSkills;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);
    const { categoryId, ...skillData } = updateSkillDto;

    if (categoryId !== undefined) {
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new BadRequestException(`Kategoriya ${categoryId} topilmadi`);
      }
      skill.category = category;
      skill.categoryId = categoryId;
    }

    Object.assign(skill, skillData);

    return this.skillRepository.save(skill);
  }

  async remove(id: number): Promise<void> {
    const result = await this.skillRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ko'nikma ${id} topilmadi`);
    }
  }
}
