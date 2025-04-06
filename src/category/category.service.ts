import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parentId === 0) {
      createCategoryDto.parentId = null; // 0 ni root kategoriya sifatida qabul qilsak, DBda NULL saqlaymiz
    } else if (createCategoryDto.parentId) {
      await this.findOne(createCategoryDto.parentId); // Ota kategoriya mavjudligini tekshirish
    }
    const skill = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(skill);
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({
        relations: ['skills', 'parent', 'children', 'projects'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error occurred while retrieving categories ${error}`,
      );
    }
  }

  async findOne(id: number): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['skills', 'parent', 'children', 'projects'],
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error occurred while retrieving category ${error}`,
      );
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const skill = await this.findOne(id);

    if (!skill) {
      throw new NotFoundException('skills not found');
    }
    if (updateCategoryDto.parentId === 0) {
      updateCategoryDto.parentId = null; // 0 ni root kategoriya sifatida qabul qilsak, DBda NULL saqlaymiz
    } else if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          "Kategoriya o'ziga ota kategoriya bo'la olmaydi.",
        );
      }
      await this.findOne(updateCategoryDto.parentId); // Yangi ota kategoriya mavjudligini tekshirish
    }
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    try {
      const category = await this.findOne(id);
      await this.categoryRepository.remove(category);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error occurred while deleting category ${error}`,
      );
    }
  }
}
