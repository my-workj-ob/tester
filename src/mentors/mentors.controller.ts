/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User } from './../user/entities/user.entity';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorVisibilityDto } from './dto/update-mentor-visibility.dto';
import { Mentor } from './entities/mentor.entity';
import { MentorService } from './mentors.service';

@ApiTags('Mentors')
@ApiBearerAuth()
@Controller('mentors')
export class MentorController {
  constructor(
    private readonly mentorService: MentorService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Mentorlar ro‘yxatini olish' })
  getAllMentors(): Promise<Mentor[]> {
    return this.mentorService.getAllMentors();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Yangi mentor qo‘shish' })
  createMentor(
    @Body() createMentorDto: CreateMentorDto,
    @Req() req,
  ): Promise<Mentor> {
    const userId = req.user.userId as number;
    console.log(req.user);

    return this.mentorService.createMentor(createMentorDto, userId);
  }
  @Patch(':id/private')
  async updateVisibility(
    @Param('id') id: number,
    @Body() updateVisibilityDto: UpdateMentorVisibilityDto,
  ) {
    const updated = await this.mentorService.updateVisibility(
      id,
      updateVisibilityDto.isPrivate,
    );
    if (!updated) {
      throw new NotFoundException('Mentor not found');
    }
    return { message: `Mentor visibility updated` };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-mentors')
  async getMyMentorships(@Req() req: any) {
    const id = Number(req.user.userId); // 🔥 `id` ni son formatiga o‘tkazamiz

    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepo.findOne({ where: { id } }); // ✅ `findOne` ishlatildi

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mentorService.getMyMentorships(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMentor(@Param('id') id: number) {
    console.log(id);
    const mentor = await this.mentorService.findOne(id);
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    return mentor;
  }
}
