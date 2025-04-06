import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './../category/category.module';
import { Skill } from './entities/skill.entity';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill]),
    forwardRef(() => CategoryModule),
  ], // ✅ MUHIM: forwardRef ishlatyapmiz],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
