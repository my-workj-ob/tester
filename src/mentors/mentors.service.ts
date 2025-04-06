/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../user/entities/user.entity';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';
import { MentorshipRequest } from './entities/mentorship-request.entity';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(MentorshipRequest)
    private mentorShipRepository: Repository<MentorshipRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllMentors(): Promise<Mentor[]> {
    try {
      return await this.mentorRepository.find({
        relations: ['user', 'user.profile'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching mentors: ${error}`,
      );
    }
  }

  async createMentor(dto: CreateMentorDto, userId: number): Promise<Mentor> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      console.log(user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const mentor = this.mentorRepository.create({
        ...dto,
        skills: dto.skills ? dto.skills.map((skill) => skill.trim()) : [],
        user,
      });

      return await this.mentorRepository.save(mentor);
    } catch (error) {
      throw new InternalServerErrorException(`Error creating mentor: ${error}`);
    }
  }

  async findOne(id: number): Promise<Mentor | null> {
    try {
      return this.mentorRepository.findOne({
        where: { id },
        relations: ['mentorshipRequests'],
      });
    } catch (error) {
      throw new InternalServerErrorException(`Error finding mentor: ${error}`);
    }
  }

  async updateVisibility(id: number, isPrivate: boolean) {
    try {
      const mentor = await this.mentorRepository.findOne({ where: { id } });
      if (!mentor) {
        throw new NotFoundException('Mentor not found');
      }

      mentor.verified = !isPrivate; // Bu yerda `verified` ni ishlatamiz yoki alohida `isPrivate` column qo'shamiz
      await this.mentorRepository.save(mentor);
      return mentor;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating mentor visibility: ${error}`,
      );
    }
  }

  async getMyMentorships(userId: number) {
    try {
      return await this.mentorShipRepository.find({
        where: [
          { mentee: { id: userId } },
          { mentor: { user: { id: userId } } },
        ],
        relations: ['mentee', 'mentor', 'mentor.user'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching mentorships: ${error}`,
      );
    }
  }
}
