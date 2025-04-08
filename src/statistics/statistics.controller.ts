/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOkResponse({ description: 'Dashboard statistikasi' })
  async getDashboardData() {
    const projectStats = await this.statisticsService.getProjectStatistics();
    const profileViewsChange =
      await this.statisticsService.getRecentProfileViewsChange();
    const totalConnections = await this.statisticsService.getTotalConnections();
    const recentActivity = await this.statisticsService.getRecentActivity();

    return {
      profileViewsChange,
      totalConnections,
      recentActivity,
      ...projectStats,
    };
  }
}
