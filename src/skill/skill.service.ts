import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { Category } from './../category/entities/category.entity';
import { CreateSkillDto } from './create-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  // ✅ Profilga tegishli skill larni olish
  async findAllByProfile(
    profileId: number,
    isPublic: boolean = true, // Default `true`
  ): Promise<Skill[]> {
    try {
      return await this.skillRepository.find({
        where: { profile: { id: profileId }, isPublic },
        relations: ['profile', 'category'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching skills for profile ${profileId}: ${error}`,
      );
    }
  }

  // ✅ Yangi skill qo‘shish (faqat o‘z profili uchun)
  async create(
    profileId: number,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    try {
      const { name, categoryId, isPublic, isVerified } = createSkillDto;

      // ✅ `categoryId` bo‘yicha categoryni bazadan topamiz
      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');

      // ✅ `profileId` bo‘yicha profileni bazadan topamiz
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      if (!profile) throw new NotFoundException('Profile not found');

      // ✅ Yangi skill yaratamiz va saqlaymiz
      if (!name || !categoryId || isPublic === undefined) {
        throw new Error('Missing required properties');
      }

      const skill = this.skillRepo.create({
        name,
        category,
        profile,
        isPublic,
        isVerified,
      });
      return await this.skillRepo.save(skill);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating skill for profile ${profileId}: ${error}`,
      );
    }
  }

  // ✅ Endorsement qo‘shish
  async endorseSkill(profileId: number, skillId: number): Promise<Skill> {
    try {
      const skill = await this.skillRepository.findOne({
        where: { id: skillId },
        relations: ['profile'],
      });

      if (!skill) throw new NotFoundException('Skill not found');
      if (skill.profile.id === profileId)
        throw new Error("You can't endorse your own skill");

      skill.endorsements += 1;
      await this.skillRepository.save(skill);
      await this.updateAllPercentages(skill.profile.id);
      return skill;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error endorsing skill ${skillId} for profile ${profileId}: ${error}`,
      );
    }
  }

  // ✅ Skill endorsementlarining barcha foizlarini yangilash
  async updateAllPercentages(profileId: number): Promise<void> {
    try {
      const skills = await this.skillRepository.find({
        where: { profile: { id: profileId } },
      });

      const maxEndorsements = Math.max(
        ...skills.map((skill) => skill.endorsements),
        1,
      );

      for (const skill of skills) {
        skill.percentage = Math.round(
          (skill.endorsements / maxEndorsements) * 100,
        );
        await this.skillRepository.save(skill);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating endorsement percentages for profile ${profileId}: ${error}`,
      );
    }
  }
}
