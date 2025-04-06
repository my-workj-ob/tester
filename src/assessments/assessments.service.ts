import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentResultService } from './../assessment-result/assessment-result.service';
import { AssessmentResult } from './../assessment-result/entities/assements-result.entity';
import { SkillService } from './../skill/skill.service';
import { CreateAssessmentDto } from './dto/assessments.dto';
import { UpdateAssessmentDto } from './dto/update-assessments.dto';
import { Assessment } from './entities/assessments.entity';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @Inject(forwardRef(() => AssessmentResultService))
    private readonly assessmentResultService: AssessmentResultService,
    private readonly skillService: SkillService, // SkillService inyeksiya
  ) {}

  async create(createAssessmentDto: CreateAssessmentDto): Promise<Assessment> {
    const { skillId, ...assessmentData } = createAssessmentDto;
    const skill = await this.skillService.findOne(skillId);
    console.log(skill);
    if (!skill) {
      throw new BadRequestException(`Ko'nikma ${skillId} topilmadi`);
    }

    const assessment = this.assessmentRepository.create({
      ...assessmentData,
      skillName: skill.name,
      skillId: skill.id,
    });
    // ok
    return this.assessmentRepository.save(assessment);
  }

  async findAll(): Promise<Assessment[]> {
    return this.assessmentRepository.find({ relations: ['skill'] });
  }

  async findOne(id: number): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
      relations: ['skill'],
    });
    if (!assessment) {
      throw new NotFoundException(`Baholash ${id} topilmadi`);
    }
    return assessment;
  }

  async findAvailable(userId: number): Promise<Assessment[]> {
    console.log(userId);

    // Foydalanuvchi ID ni tekshirish
    if (isNaN(userId) || userId <= 0) {
      console.error("Noto'g'ri foydalanuvchi IDsi:", userId);
      throw new UnauthorizedException(
        "Foydalanuvchi IDsi topilmadi yoki noto'g'ri formatda.",
      );
    }

    // 1. Barcha baholashlarni olish
    const allAssessments = await this.assessmentRepository.find();
    console.log('allAssessments:', allAssessments);

    // 2. Foydalanuvchi tomonidan tugallangan baholashlar ro'yxatini olish
    const completedAssessments =
      await this.assessmentResultService.findByUserId(userId);
    const completedAssessmentIds = completedAssessments.map(
      (result) => result.assessmentId,
    );

    // 3. Tugallangan baholashlarni mavjudlar ro'yxatidan chiqarib tashlash
    const availableAssessments = allAssessments.filter(
      (assessment) => !completedAssessmentIds.includes(assessment.id),
    );

    return availableAssessments;
  }

  async findCompletedByUserId(userId: number): Promise<AssessmentResult[]> {
    return this.assessmentResultService.findByUserId(userId);
  }

  async update(
    id: number,
    updateAssessmentDto: UpdateAssessmentDto,
  ): Promise<Assessment> {
    const assessment = await this.findOne(id);
    const { skillId, ...assessmentData } = updateAssessmentDto;

    if (skillId !== undefined) {
      const skill = await this.skillService.findOne(skillId);
      if (!skill) {
        throw new BadRequestException(`Ko'nikma ${skillId} topilmadi`);
      }
      assessment.skill = skill;
      assessment.skillId = skillId;
    }

    Object.assign(assessment, assessmentData);

    return this.assessmentRepository.save(assessment);
  }
}
