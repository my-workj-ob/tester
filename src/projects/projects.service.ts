import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Equal, ILike } from 'typeorm';
import { Projects } from './entities/create-projecs.entity';
import { CreateProjectsDto } from './dto/create-projects-dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Projects)
    private readonly projectsRepository: Repository<Projects>,
  ) {}

  async create(
    createProjectsDto: CreateProjectsDto,
    userId: number,
  ): Promise<Projects> {
    const project = this.projectsRepository.create({
      ...createProjectsDto,
      userId: Number(userId),
    });

    return await this.projectsRepository.save(project);
  }

  async findAll(
    category?: string,
    status?: string,
    skills?: string,
    search?: string,
  ): Promise<Projects[]> {
    const qb = this.projectsRepository.createQueryBuilder('project');

    if (category && category !== 'All categories') {
      qb.andWhere('project.category = :category', { category });
    }

    if (status && status !== 'All statuses') {
      qb.andWhere('project.status = :status', { status });
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      skillsArray.forEach((skill, i) => {
        qb.andWhere(`project.technologies LIKE :skill${i}`, {
          [`skill${i}`]: `%${skill}%`,
        });
      });
    }

    if (search) {
      qb.andWhere('project.title ILIKE :search', { search: `%${search}%` });
    }

    return await qb.getMany();
  }

  async findOne(id: number): Promise<Projects> {
    return await this.projectsRepository.findOneOrFail({ where: { id } });
  }

  async update(
    id: number,
    updateProjectsDto: Partial<CreateProjectsDto>,
  ): Promise<Projects> {
    await this.projectsRepository.update(id, updateProjectsDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
