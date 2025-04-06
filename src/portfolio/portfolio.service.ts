/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './../profile/entities/profile.entity';
import { User } from './../user/entities/user.entity';
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
    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.userProfile.findOne({
      where: { user: { id: Number(userId) } },
      relations: ['user'], // 🛠 YANGI QO‘SHILGAN QATOR
    });

    if (!profile) throw new NotFoundException('Profile not found');
    const { categoryId, ...restData } = data; // categoryId ni ajratib olamiz

    // categoryId ni raqamga o'tkazish (agar kerak bo'lsa va ID raqam bo'lsa)
    const categoryIdNum: any =
      categoryId !== undefined && categoryId !== null
        ? Number(categoryId)
        : null;
    // Agar categoryId majburiy bo'lsa va yaroqsiz bo'lsa xatolik berish mumkin
    if (
      categoryId !== undefined &&
      (categoryId === null || isNaN(categoryIdNum))
    ) {
      throw new BadRequestException('Invalid or missing Category ID');
    }

    const portfolio = this.projectRepository.create({
      ...restData, // Boshqa ma'lumotlar (title, description...)
      user,
      profile,
      ownProduct: true,
      ...(categoryIdNum !== null && { category: { id: categoryIdNum } }),
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
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('portfolio.category', 'category'); // <-- Category jadvalini JOIN qilamiz va 'category' aliasini beramiz

    // Agar ownProduct = true bo'lsa, userId bilan filter qilamiz
    if (filters.ownProduct === true && filters.userId) {
      // userId mavjudligini tekshirish yaxshi amaliyot
      query.where('portfolio.userId = :userId', { userId: filters.userId });
    }
    // Agar ownProduct = false bo'lsa, boshqa userlarning productlarini olish
    else if (filters.ownProduct === false && filters.userId) {
      // userId mavjudligini tekshirish yaxshi amaliyot
      // Agar boshqa filtrlar bo'lmasa where ishlatamiz, aks holda andWhere
      if (query.expressionMap.wheres.length === 0) {
        query.where('portfolio.userId != :userId', { userId: filters.userId });
      } else {
        query.andWhere('portfolio.userId != :userId', {
          userId: filters.userId,
        });
      }
    }

    // Kategoriya bo'yicha filtr (TO'G'RILANGAN QISM)
    if (filters.category) {
      query.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${filters.category}%`, // % belgilari qisman moslikni qidiradi
      });
    }

    // Sort qilish
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'trending':
          // "Trending" odatda ko'rishlar va vaqt kombinatsiyasi bo'lishi mumkin,
          // lekin hozircha faqat ko'rishlar bo'yicha
          query.orderBy('portfolio.views', 'DESC');
          break;
        case 'newest':
          // createdAt ustuni mavjud deb taxmin qilinadi (TypeORM odatda qo'shadi)
          // Agar boshqa nomda bo'lsa, moslashtiring
          query.orderBy('portfolio.createdAt', 'DESC'); // Agar createdAt mavjud bo'lmasa, ID yoki boshqa vaqt ustunini ishlating
          break;
        case 'most_liked':
          query.orderBy('portfolio.likesCount', 'DESC');
          break;
        case 'most_viewed':
          query.orderBy('portfolio.views', 'DESC');
          break;
        case 'category':
          // Saralashni ham JOIN qilingan kategoriyaning nomi bo'yicha qilish kerak
          query.orderBy('category.name', 'ASC');
          break;
        default:
          // Standart saralash (masalan, eng yangilari)
          query.orderBy('portfolio.createdAt', 'DESC'); // Yoki ID bo'yicha
          break;
      }
    } else {
      // Agar sortBy ko'rsatilmagan bo'lsa, standart saralash
      query.orderBy('portfolio.createdAt', 'DESC'); // Yoki ID bo'yicha
    }

    // createdAt ustuni mavjudligini tekshiring. Agar Project entityda yo'q bo'lsa,
    // @CreateDateColumn() dekoratorini qo'shing yoki ID bo'yicha saralang.
    // query.orderBy('portfolio.id', 'DESC'); // Masalan, ID bo'yicha saralash

    return query.getMany();
  }
  async incrementViewCount(portfolioId: string) {
    await this.projectRepository.increment(
      { id: Number(portfolioId) },
      'views',
      1,
    );
  }

  async toggleLike(projectId: number, userId: number): Promise<boolean> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['likes'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // User oldin like bosganmi?
    const hasLiked = project.likes.some((likeUser) => likeUser.id === userId);

    if (hasLiked) {
      project.likes = project.likes.filter(
        (likeUser) => likeUser.id !== userId,
      );
      project.likesCount -= 1; // ✅ Like olib tashlanganda kamaytirish
    } else {
      project.likes.push(user);
      project.likesCount += 1; // ✅ Like qo‘shilganda oshirish
    }

    await this.projectRepository.save(project);
    return !hasLiked; // True → Liked, False → Unliked
  }

  async checkLikeStatus(projectId: number, userId: number): Promise<boolean> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['likes'],
    });

    if (!project) throw new NotFoundException('Project not found');

    return project.likes.some((user) => user.id === userId);
  }

  async addComment(portfolioId: string) {
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
