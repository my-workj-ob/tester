/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from '../connection/entity/connection.entity';
import { Project } from './../portfolio/entities/project.entity';
import { User } from './../user/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
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

  async getRecentProfileViewsChange(): Promise<number> {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    const twoWeeksAgoStart = new Date(now);
    twoWeeksAgoStart.setDate(now.getDate() - 14);
    const oneWeekAgoEnd = new Date(now);
    oneWeekAgoEnd.setDate(now.getDate() - 7);

    const currentViews = await this.userRepository
      .createQueryBuilder('user')
      .select('SUM(user.profileViews)', 'totalViews')
      .where('user.updatedAt >= :start AND user.updatedAt < :end', {
        start: lastWeekStart,
        end: now,
      })
      .getRawOne()
      .then((result) => Number(result?.totalViews) || 0);

    const previousViews = await this.userRepository
      .createQueryBuilder('user')
      .select('SUM(user.profileViews)', 'totalViews')
      .where('user.updatedAt >= :start AND user.updatedAt < :end', {
        start: twoWeeksAgoStart,
        end: oneWeekAgoEnd,
      })
      .getRawOne()
      .then((result) => Number(result?.totalViews) || 0);
    if (previousViews === 0) {
      return currentViews > 0 ? 100 : 0;
    }

    return Math.round(((currentViews - previousViews) / previousViews) * 100);
  }

  async getTotalConnections(): Promise<number> {
    return this.connectionRepository.count({ where: { status: 'accepted' } });
  }

  async getRecentActivity(limit: number = 5): Promise<any[]> {
    const connections = await this.connectionRepository.find({
      where: { status: 'accepted' },
      order: { updatedAt: 'DESC' },
      relations: [
        'requester',
        'receiver',
        'requester.profile',
        'receiver.profile',
      ],
      take: limit,
    });

    const recentActivity = [
      ...connections.map((conn) => ({
        type: 'connection',
        user1: conn.requester,
        user2: conn.receiver,
        date: conn.updatedAt,
        text: `${conn.requester.profile?.firstName || conn.requester.email} connected with ${conn.receiver.profile?.firstName || conn.receiver.email}`,
      })),
    ];

    return recentActivity.slice(0, limit);
  }
}
