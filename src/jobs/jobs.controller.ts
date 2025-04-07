/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CreateJobDto, FindAllJobsQueryDto } from './dto/jobs.dto';
import { Job } from './entity/jobs.entity';
import { JobsService } from './jobs.service';

@Controller('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body(new ValidationPipe()) createJobDto: CreateJobDto,
    @Request() req,
  ) {
    return this.jobsService.create(createJobDto, req.user.userId);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe()) query: FindAllJobsQueryDto,
    @Request() req,
  ) {
    return this.jobsService.findAll(query, req.user?.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateJobDto: Partial<CreateJobDto>,
    @Request() req,
  ) {
    return this.jobsService.update(+id, updateJobDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(+id, req.user.userId);
  }
  @Get('/me/listings')
  @ApiOkResponse({
    description: 'Foydalanuvchining e’lonlari ro‘yxati',
    type: [Job],
  })
  async findMyListings(@Request() req) {
    return this.jobsService.findMyListings(req.user.userId); // Servisdagi metodni chaqirish
  }
}
