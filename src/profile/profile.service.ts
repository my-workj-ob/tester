import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Skill } from 'src/skill/entities/skill.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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
  ) {}

  async updateNotifications(userId: number, dto: UpdateNotificationDto) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new BadRequestException('Foydalanuvchi topilmadi');

    Object.assign(profile, dto);
    await this.profileRepository.save(profile);
    return { message: 'Bildirishnomalar sozlandi' };
  }

  async updatePrivacy(userId: number, dto: UpdatePrivacyDto) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new BadRequestException('Foydalanuvchi topilmadi');

    Object.assign(profile, dto);
    await this.profileRepository.save(profile);
    return { message: 'Maxfiylik sozlamalari yangilandi' };
  }
  async changePassword(userId: number, dto: ChangePasswordDto) {
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
  }

  async getProfile(userId: number): Promise<Profile> {
    console.log('User ID:', userId);

    // Profilni user bilan birga topamiz
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
      relations: ['user'], // Profilga bog‘langan user ma’lumotlarini yuklash
    });

    console.log('Profile:', profile); // Profil logi

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Profile> {
    console.log(userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

    const result = await this.profileRepository.update(userId, dto);

    if (result.affected === 0) {
      throw new Error('Profile not found or update failed');
    }

    return this.getProfile(userId);
  }

  async addSkill(userId: number, dto: SkillDto): Promise<Skill> {
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
    });
    console.log('user', userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const skill = this.skillRepository.create({ ...dto, profile });
    return this.skillRepository.save(skill);
  }

  async removeSkill(skillId: number): Promise<void> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillRepository.remove(skill);
  }

  async uploadAvatar(userId: number, avatarUrl: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.avatar = avatarUrl;
    return await this.profileRepository.save(profile); // Saqlash
  }

  async updateAvatar(profileId: number, avatarUrl: string): Promise<Profile> {
    await this.profileRepository.update(profileId, { avatar: avatarUrl });
    return this.getProfile(profileId);
  }
}
