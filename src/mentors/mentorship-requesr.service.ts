import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentorshipRequestDto } from './dto/create-mentorship.dto';
import { Mentor } from './entities/mentor.entity';
import { MentorshipRequest } from './entities/mentorship-request.entity';

@Injectable()
export class MentorshipRequestService {
  constructor(
    @InjectRepository(MentorshipRequest)
    private mentorshipRequestRepository: Repository<MentorshipRequest>,
  ) {}
  async findMentorships(mentorId?: number) {
    const whereCondition = mentorId ? { mentor: { id: mentorId } } : {};
    return this.mentorshipRequestRepository.find({
      where: whereCondition,
      relations: ['mentor'],
    });
  }
  async updateStatus(id: number, status: 'accepted' | 'rejected') {
    const request = await this.mentorshipRequestRepository.findOne({
      where: { id },
    });
    if (!request || request.status !== 'pending') {
      return null;
    }
    request.status = status;
    await this.mentorshipRequestRepository.save(request);
    return request;
  }

  async createMentorshipRequest(
    mentor: Mentor,
    createRequestDto: CreateMentorshipRequestDto,
  ) {
    const request = this.mentorshipRequestRepository.create({
      mentor,
      ...createRequestDto,
      status: 'pending',
    });
    return this.mentorshipRequestRepository.save(request);
  }
}
