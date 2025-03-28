import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMentorshipRequestDto } from './dto/create-mentorship.dto';
import { UpdateMentorshipStatusDto } from './dto/update-mentorship.dto';
import { MentorService } from './mentors.service';
import { MentorshipRequestService } from './mentorship-requesr.service';

@ApiTags('Mentorship Requests')
@Controller('mentorship-requests')
export class MentorshipRequestController {
  constructor(
    private readonly mentorshipRequestService: MentorshipRequestService,
    private readonly mentorsService: MentorService,
  ) {}

  @Get()
  async getMentorships(@Query('mentorId') mentorId?: number) {
    return this.mentorshipRequestService.findMentorships(mentorId);
  }

  @Post()
  @ApiOperation({ summary: 'Mentorship so‘rovi yuborish' })
  @ApiBody({ type: CreateMentorshipRequestDto })
  async requestMentorship(
    @Param('id') id: number,
    @Body() createRequestDto: CreateMentorshipRequestDto,
  ) {
    const mentor = await this.mentorsService.findOne(id);
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    return this.mentorshipRequestService.createMentorshipRequest(
      mentor,
      createRequestDto,
    );
  }
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateMentorshipStatusDto,
  ) {
    const updated = await this.mentorshipRequestService.updateStatus(
      id,
      updateStatusDto.status,
    );
    if (!updated) {
      throw new NotFoundException(
        'Mentorship request not found or already processed',
      );
    }
    return { message: `Mentorship request ${updateStatusDto.status}` };
  }
}
