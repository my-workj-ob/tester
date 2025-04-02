/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorVisibilityDto } from './dto/update-mentor-visibility.dto';
import { Mentor } from './entities/mentor.entity';
import { MentorService } from './mentors.service';

@ApiTags('Mentors')
@ApiBearerAuth()
@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}
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
    @Req() req: any,
  ): Promise<Mentor> {
    const userId = req.user.userId;
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
  @Get(':id')
  async getMentor(@Param('id') id: number) {
    const mentor = await this.mentorService.findOne(id);
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    return mentor;
  }
}
