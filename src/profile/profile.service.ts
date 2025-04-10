/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Skill } from './../skill/entities/skill.entity';
import { ProfileStat } from './../user/entities/profile-stat.entity';
import { User } from './../user/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SkillDto } from './dto/skill.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    @InjectRepository(User) // User uchun inject qilish kerak
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProfileStat)
    private profileStatRepository: Repository<ProfileStat>,
  ) {}

  async updateNotifications(userId: number, dto: UpdateNotificationDto) {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!profile) throw new BadRequestException('Foydalanuvchi topilmadi');

      Object.assign(profile, dto);
      await this.profileRepository.save(profile);
      return { message: 'Bildirishnomalar sozlandi' };
    } catch (error) {
      throw new Error(`Error updating notifications: ${error}`);
    }
  }

  async updatePrivacy(userId: number, dto: UpdatePrivacyDto) {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!profile) throw new BadRequestException('Foydalanuvchi topilmadi');

      Object.assign(profile, dto);
      await this.profileRepository.save(profile);
      return { message: 'Maxfiylik sozlamalari yangilandi' };
    } catch (error) {
      throw new Error(`Error updating privacy: ${error}`);
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }

      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Joriy parol noto‘g‘ri');
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepository.save(user);

      return { message: 'Parol muvaffaqiyatli yangilandi' };
    } catch (error) {
      throw new Error(`Error changing password: ${error}`);
    }
  }

  async getProfile(userId: number): Promise<Profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: userId },
        relations: ['user', 'skills', 'notification'], // Profilga bog‘langan user ma’lumotlarini yuklash
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return profile;
    } catch (error) {
      throw new Error(`Error getting profile: ${error}`);
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Profile> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await this.profileRepository.update(userId, dto);

      if (result.affected === 0) {
        throw new Error('Profile not found or update failed');
      }

      return this.getProfile(userId);
    } catch (error) {
      throw new Error(`Error updating profile: ${error}`);
    }
  }

  async addSkill(userId: number, dto: SkillDto): Promise<Skill> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: userId },
      });

      if (!profile) throw new NotFoundException('Profile not found');

      const skill = this.skillRepository.create({ ...dto, profile });
      return this.skillRepository.save(skill);
    } catch (error) {
      throw new Error(`Error adding skill: ${error}`);
    }
  }

  async removeSkill(skillId: number): Promise<void> {
    try {
      const skill = await this.skillRepository.findOne({
        where: { id: skillId },
      });

      if (!skill) throw new NotFoundException('Skill not found');
      await this.skillRepository.remove(skill);
    } catch (error) {
      throw new Error(`Error removing skill: ${error}`);
    }
  }

  async uploadAvatar(userId: number, avatarUrl: string): Promise<Profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: userId },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      profile.avatar = avatarUrl;
      return await this.profileRepository.save(profile); // Saqlash
    } catch (error) {
      throw new Error(`Error uploading avatar: ${error}`);
    }
  }

  async updateAvatar(profileId: number, avatarUrl: string): Promise<Profile> {
    try {
      await this.profileRepository.update(profileId, { avatar: avatarUrl });
      return this.getProfile(profileId);
    } catch (error) {
      throw new Error(`Error updating avatar: ${error}`);
    }
  }

  async getProfileStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profileStat', 'user.profile'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const profileStat = user.profileStat;

    return {
      id: user.id,
      user: {
        user,
      },
      rating: profileStat.rating,
      content: profileStat.content,
      date: profileStat.date,
      likes: profileStat.likes,
      replies: profileStat.replies,
    };
  }
}
