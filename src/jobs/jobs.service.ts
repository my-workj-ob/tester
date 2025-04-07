import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
  Repository,
} from 'typeorm';
import { User } from './../user/entities/user.entity';
import { CreateJobDto, FindAllJobsQueryDto } from './dto/jobs.dto';
import { Job } from './entity/jobs.entity';
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async create(createJobDto: CreateJobDto, employerId: number): Promise<Job> {
    const employer = await this.userRepo.findOne({ where: { id: employerId } });
    if (!employer) {
      throw new NotFoundException(`Employer with ID ${employerId} not found`);
    }

    const job = this.jobsRepository.create({
      ...createJobDto,
      employer: employer,
    });

    return this.jobsRepository.save(job);
  }

  // ... (create, findOne, update, remove, findMyListings metodlari)

  async findAll(query: FindAllJobsQueryDto, userId?: number): Promise<Job[]> {
    const {
      company,
      name,
      skills: querySkills, // So'rovdan kelgan skillarni alohida nomlaymiz
      minPrice,
      maxPrice,
      tags,
      easyApply,
      ...pagination
    } = query;

    const whereConditions: FindOptionsWhere<Job>[] = [];
    const order: FindManyOptions<Job>['order'] = {};

    // Asosiy filtrlash (kiritilgan bo'lsa)
    if (company)
      whereConditions.push({
        companyName: Raw((alias) => `${alias} ILIKE '%${company}%'`),
      });
    if (name)
      whereConditions.push({
        jobTitle: Raw((alias) => `${alias} ILIKE '%${name}%'`),
      });
    if (minPrice !== undefined)
      whereConditions.push({ salaryMin: MoreThanOrEqual(minPrice) });
    if (maxPrice !== undefined)
      whereConditions.push({ salaryMax: LessThanOrEqual(maxPrice) });
    if (easyApply !== undefined)
      whereConditions.push({ enableEasyApply: easyApply });

    let userSkillsArray: string[] = [];
    if (userId) {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['skills'],
      });
      console.log('user skills: ', user?.skills);

      if (user && user.skills) {
        userSkillsArray = user.skills.map((skill) => skill.name.trim());
        if (!querySkills && userSkillsArray.length > 0) {
          // Agar so'rovda skills bo'lmasa, avtomatik ravishda foydalanuvchi skillari bo'yicha filtrlash
          whereConditions.push(
            ...userSkillsArray.map((skill) => ({
              requiredSkills: Raw((alias) => `${alias} ILIKE '%${skill}%'`),
            })),
          );
          // Mos keladigan e'lonlarni ro'yxat boshiga chiqarish uchun order qo'shamiz
          order.requiredSkills = 'ASC'; // Yoki boshqa mos keluvchi tartib
        }
      }
    }

    if (querySkills) {
      const skillsArray = querySkills.split(',').map((s) => s.trim());
      whereConditions.push(
        ...skillsArray.map((skill) => ({
          requiredSkills: Raw((alias) => `${alias} ILIKE '%${skill}%'`),
        })),
      );
    }

    if (tags) {
      const tagsArray = tags.split(',').map((t) => t.trim());
      whereConditions.push(
        ...tagsArray.map((tag) => ({
          jobDescription: Raw((alias) => `${alias} ILIKE '%${tag}%'`),
        })),
      );
    }

    const findOptions: FindManyOptions<Job> = {
      where: whereConditions.length > 0 ? whereConditions : {},
      skip: ((pagination.page ?? 1) - 1) * (pagination.limit ?? 10),
      take: pagination.limit ?? 10,
      order: Object.keys(order).length > 0 ? order : { createdAt: 'DESC' }, // Agar order bo'lsa, ishlatamiz, aks holda standart tartib
    };

    return this.jobsRepository.find(findOptions);
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOneBy({ id });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(
    id: number,
    updateJobDto: Partial<CreateJobDto>,
    employerId: number,
  ): Promise<Job> {
    const job = await this.findOne(id);
    if (job.employerId !== employerId) {
      throw new NotFoundException(
        `Job with ID ${id} not found for this employer`,
      );
    }

    if (updateJobDto.requiredSkills) {
      job.requiredSkills = updateJobDto.requiredSkills;
    }
    // Qolgan fieldlar update qilinadi
    Object.assign(job, updateJobDto);

    return this.jobsRepository.save(job);
  }

  async remove(id: number, employerId: number): Promise<void> {
    const job = await this.findOne(id);
    if (job.employerId !== employerId) {
      throw new NotFoundException(
        `Job with ID ${id} not found for this employer`,
      );
    }
    await this.jobsRepository.delete(id);
  }

  getJobStatus(job: Job): string {
    const currentDate = new Date();

    if (
      job.applicationDeadline &&
      new Date(job.applicationDeadline) > currentDate
    ) {
      return 'Active';
    } else if (
      job.applicationDeadline &&
      new Date(job.applicationDeadline) <= currentDate
    ) {
      return 'Expired';
    } else {
      return 'No Active';
    }
  }

  async findMyListings(userId: number): Promise<Job[]> {
    const jobs = await this.jobsRepository.find({
      where: { employerId: userId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      jobs.map((job) => ({
        ...job,
        status: this.getJobStatus(job), // Servisdagi metodni chaqirish
      })),
    );
  }
}
