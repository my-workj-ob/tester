import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentService } from './../assessments/assessments.service';
import { UserService } from './../user/user.service';
import { CreateCodingSubmissionDto } from './dto/create-coding-submission.dto';
import { UpdateCodingSubmissionDto } from './dto/update-coding-submission.dto';
import { CodingSubmission } from './entities/coding-submission.entity';

@Injectable()
export class CodingSubmissionService {
  constructor(
    @InjectRepository(CodingSubmission)
    private readonly codingSubmissionRepository: Repository<CodingSubmission>,
    private readonly userService: UserService,

    @Inject(forwardRef(() => AssessmentService)) // 🛠️ MUHIM
    private readonly assessmentService: AssessmentService,
  ) {}

  async create(
    createCodingSubmissionDto: CreateCodingSubmissionDto,
  ): Promise<CodingSubmission> {
    const { userId, assessmentId, code } = createCodingSubmissionDto;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException(`Foydalanuvchi ${userId} topilmadi`);
    }

    const assessment = await this.assessmentService.findOne(assessmentId);
    if (!assessment) {
      throw new BadRequestException(`Baholash ${assessmentId} topilmadi`);
    }

    const codingSubmission = this.codingSubmissionRepository.create({
      user: { id: userId },
      assessment: { id: assessmentId },
      code,
    });
    return this.codingSubmissionRepository.save(codingSubmission);
  }

  async findAll(): Promise<CodingSubmission[]> {
    return this.codingSubmissionRepository.find({
      relations: ['user', 'assessment'],
    });
  }

  async findOne(id: number): Promise<CodingSubmission> {
    const codingSubmission = await this.codingSubmissionRepository.findOne({
      where: { id },
      relations: ['user', 'assessment'],
    });
    if (!codingSubmission) {
      throw new NotFoundException(`Kod topshirig'i javobi ${id} topilmadi`);
    }
    return codingSubmission;
  }

  async update(
    id: number,
    updateCodingSubmissionDto: UpdateCodingSubmissionDto,
  ): Promise<CodingSubmission> {
    const codingSubmission = await this.findOne(id);
    Object.assign(codingSubmission, updateCodingSubmissionDto);
    return this.codingSubmissionRepository.save(codingSubmission);
  }

  async remove(id: number): Promise<void> {
    const codingSubmission = await this.findOne(id);
    await this.codingSubmissionRepository.remove(codingSubmission);
  }
}
