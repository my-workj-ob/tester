import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './../profile/entities/profile.entity';
import { User } from './../user/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectController } from './portfolio.controller';
import { ProjectService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Profile])], // Entity qo'shildi
  controllers: [ProjectController], // Controller qo'shildi
  providers: [ProjectService], // To'g'ri service nomi ishlatilmoqda
  exports: [ProjectService], // Agar boshqa modullarda ishlatilsa, export qilish kerak
})
export class PortfolioModule {}
