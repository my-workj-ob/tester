/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './../portfolio/entities/project.entity';
import { User } from './../user/entities/user.entity';
import { Rating } from './entities/rating.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
  ) {}

  async getProjectStatistics() {
    const projects = await this.projectRepository.find({
      relations: ['ratings'],
    });

    const totalUsers = await this.userRepository.count();
    const totalProjects = projects.length;
    const totalRatings = projects.reduce(
      (acc, project) => acc + project.ratings.length,
      0,
    );
    const avgRating = totalRatings
      ? projects.reduce(
          (acc, project) =>
            acc +
            (project.ratings.reduce((sum, r) => sum + r.value, 0) /
              project.ratings.length || 0),
          0,
        ) / projects.length
      : 0;

    return {
      totalUsers,
      totalProjects,
      avgRating: parseFloat(avgRating.toFixed(1)),
      engagement: Math.round((totalRatings / (totalUsers || 1)) * 100), // Misol uchun
    };
  }
}
