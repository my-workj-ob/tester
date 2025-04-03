import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './../portfolio/entities/project.entity';
import { User } from './../user/entities/user.entity';
import { Rating } from './entities/rating.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Rating])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
