import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './../skill/entities/skill.entity';
import { SkillModule } from './../skill/skill.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Skill]),
    forwardRef(() => SkillModule),
  ], // ✅ forwardRef bu yerda ham],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
