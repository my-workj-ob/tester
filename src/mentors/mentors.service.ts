import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
  ) {}

  async getAllMentors(): Promise<Mentor[]> {
    return await this.mentorRepository.find();
  }

  async createMentor(createMentorDto: CreateMentorDto): Promise<Mentor> {
    const newMentor = this.mentorRepository.create(createMentorDto);
    return await this.mentorRepository.save(newMentor);
  }

  async findOne(id: number): Promise<Mentor | null> {
    return this.mentorRepository.findOne({
      where: { id },
      relations: ['mentorshipRequests'],
    });
  }
  async updateVisibility(id: number, isPrivate: boolean) {
    const mentor = await this.mentorRepository.findOne({ where: { id } });
    if (!mentor) {
      return null;
    }
    mentor.verified = !isPrivate; // Bu yerda `verified` ni ishlatamiz yoki alohida `isPrivate` column qo'shamiz
    await this.mentorRepository.save(mentor);
    return mentor;
  }
}
