import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './../category/category.module'; // CategoryModule import qilindi
import { Category } from './../category/entities/category.entity';
import { Mentor } from './../mentors/entities/mentor.entity';
import { Profile } from './../profile/entities/profile.entity';
import { Skill } from './../skill/entities/skill.entity';
import { SkillModule } from './../skill/skill.module';
import { SkillService } from './../skill/skill.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Mentor, Skill, Category]),
    CategoryModule,
    SkillModule,
  ],
  controllers: [UserController],
  providers: [UserService, SkillService],
  exports: [UserService],
})
export class UserModule {}
