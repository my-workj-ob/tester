import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error occurred while creating category ${error}`,
      );
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({ relations: ['skills'] });
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
        relations: ['skills'],
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
    try {
      const category = await this.findOne(id);
      this.categoryRepository.merge(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error occurred while updating category ${error}`,
      );
    }
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
