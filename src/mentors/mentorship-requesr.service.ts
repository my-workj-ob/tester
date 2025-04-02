import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const whereCondition = mentorId ? { mentor: { id: mentorId } } : {};
      return await this.mentorshipRequestRepository.find({
        where: whereCondition,
        relations: ['mentor'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching mentorship requests: ${error}`,
      );
    }
  }

  async updateStatus(id: number, status: 'accepted' | 'rejected') {
    try {
      const request = await this.mentorshipRequestRepository.findOne({
        where: { id },
      });

      if (!request || request.status !== 'pending') {
        throw new NotFoundException('Request not found or already processed');
      }

      request.status = status;
      await this.mentorshipRequestRepository.save(request);
      return request;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating mentorship request status: ${error}`,
      );
    }
  }

  async createMentorshipRequest(
    mentor: Mentor,
    createRequestDto: CreateMentorshipRequestDto,
  ) {
    try {
      const request = this.mentorshipRequestRepository.create({
        mentor,
        ...createRequestDto,
        status: 'pending',
      });
      return await this.mentorshipRequestRepository.save(request);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating mentorship request: ${error}`,
      );
    }
  }
}
