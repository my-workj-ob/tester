import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './../connection/entity/connection.entity';
import { Project } from './../portfolio/entities/project.entity';
import { User } from './../user/entities/user.entity';
import { Rating } from './entities/rating.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Rating, Connection])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
