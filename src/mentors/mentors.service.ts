/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../user/entities/user.entity';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllMentors(): Promise<Mentor[]> {
    return await this.mentorRepository.find({
      relations: ['user', 'user.profile'],
    });
  }

  async createMentor(dto: CreateMentorDto, userId): Promise<Mentor> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ `skills` ni PostgreSQL ARRAY formatida saqlash
    const mentor = this.mentorRepository.create({
      ...dto,
      skills: dto.skills ? dto.skills.map((skill) => skill.trim()) : [],
      user,
    });

    return await this.mentorRepository.save(mentor);
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
