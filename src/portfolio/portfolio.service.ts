/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profile/entities/profile.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PortfolioFilterDto } from './dto/filter.dto';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly userProfile: Repository<Profile>,
  ) {}

  async createPortfolio(data: CreatePortfolioDto, userId: string) {
    console.log('user: ', userId);

    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });
    console.log(user);

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.userProfile.findOne({
      where: { user: { id: Number(userId) } },
      relations: ['user'], // 🛠 YANGI QO‘SHILGAN QATOR
    });

    console.log(profile);

    if (!profile) throw new NotFoundException('Profile not found');

    const portfolio = this.projectRepository.create({
      ...data,
      user,
      ownProduct: true,
      profile,
    });

    return this.projectRepository.save(portfolio);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['user', 'profile'] });
  }

  async findOne(id: number): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'profile'],
    });
  }
  async getFilteredPortfolios(filters: PortfolioFilterDto) {
    const query = this.projectRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile'); // user ning profilini ham chaqiramiz

    // Agar ownProduct = true bo'lsa, userId bilan filter qilamiz
    if (filters.ownProduct === true) {
      query.where('portfolio.userId = :userId', { userId: filters.userId });
    }
    // Agar ownProduct = false bo'lsa, boshqa userlarning productlarini olish
    else if (filters.ownProduct === false) {
      query.where('portfolio.userId != :userId', { userId: filters.userId });
    }
    // Agar ownProduct = false bo'lsa, boshqa userlarning productlarini olish
    if (filters.category) {
      query.andWhere('portfolio.category ILIKE :category', {
        category: `%${filters.category}%`,
      });

      console.log('Kategoriyaga qarab filtr ishladi:', filters.category);
    }

    // Sort qilish
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'trending':
          query.orderBy('portfolio.views', 'DESC');
          break;
        case 'newest':
          query.orderBy('portfolio.createdAt', 'DESC');
          break;
        case 'most_liked':
          query.orderBy('portfolio.likesCount', 'DESC');
          break;
        case 'most_viewed':
          query.orderBy('portfolio.views', 'DESC');
          break;
        case 'category':
          query.orderBy('portfolio.category', 'ASC'); // Kategoriya nomi bo'yicha saralash
          break;
        default:
          break;
      }
    }

    return query.getMany();
  }

  async incrementViewCount(portfolioId: string) {
    await this.projectRepository.increment(
      { id: Number(portfolioId) },
      'views',
      1,
    );
  }

  async likePortfolio(portfolioId: string, userId: string) {
    const portfolio = await this.projectRepository.findOne({
      where: { id: Number(portfolioId) },
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    portfolio.likesCount += 1;
    return this.projectRepository.save(portfolio);
  }

  async addComment(portfolioId: string, commentText: string, userId: string) {
    const portfolio = await this.projectRepository.findOne({
      where: { id: Number(portfolioId) },
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    portfolio.commentsCount += 1;
    return this.projectRepository.save(portfolio);
  }

  async update(id: number, projectData: Partial<CreatePortfolioDto>) {
    await this.projectRepository.update(id, projectData);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.projectRepository.delete(id);
    return { message: 'Loyiha muvaffaqiyatli o‘chirildi' };
  }
}
