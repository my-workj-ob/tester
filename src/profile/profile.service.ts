/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Message } from './../chat/entities/chat.entity';
import { ConnectionService } from './../connection/connection.service';
import { Connection } from './../connection/entity/connection.entity';
import { Skill } from './../skill/entities/skill.entity';
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

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    private connectionService: ConnectionService,
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
      const connections = profile.user.sentConnections;
      return {
        ...profile,
        ...connections,
      };
    } catch (error) {
      throw new Error(`Error getting profile: ${error}`);
    }
  }

  async getRecentActivityForUser(
    userId: number,
    limit: number = 5,
  ): Promise<any[]> {
    const connections = await this.connectionRepository.find({
      where: [
        { requester: { id: userId }, status: 'accepted' },
        { receiver: { id: userId }, status: 'accepted' },
      ],
      order: { updatedAt: 'DESC' },
      relations: [
        'requester',
        'receiver',
        'requester.profile',
        'receiver.profile',
      ],
      take: limit,
    });
    const messages = await this.messageRepository.find({
      where: { receiver: { id: userId } },
      order: { timestamp: 'DESC' },
      relations: ['sender', 'sender.profile'],
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const messageMap = new Map<
      number,
      {
        message: any;
        newCount: number;
        oldCount: number;
      }
    >();

    for (const msg of messages) {
      const senderId = msg.sender.id;
      const isNew = msg.timestamp > oneDayAgo;

      if (!messageMap.has(senderId)) {
        // Birinchi xabar — oxirgi deb belgilaymiz
        messageMap.set(senderId, {
          message: msg,
          newCount: isNew ? 1 : 0,
          oldCount: isNew ? 0 : 1,
        });
      } else {
        const entry = messageMap.get(senderId)!;
        if (isNew) {
          entry.newCount += 1;
        } else {
          entry.oldCount += 1;
        }
      }
    }

    const messageActivities = Array.from(messageMap.values()).map(
      ({ message, newCount, oldCount }) => {
        const userName =
          message.sender.profile?.firstName || message.sender.email;

        let text = `${userName} sent you a message`;

        if (newCount > 1) {
          text = `${userName} sent you ${newCount} new messages`;
        }

        if (oldCount > 0 && newCount === 0) {
          text = `${userName} has ${oldCount} old messages`;
        }

        if (oldCount > 0 && newCount > 0) {
          text += ` (+${oldCount} older)`;
        }

        return {
          type: 'message',
          user: message.sender,
          date: message.timestamp,
          text,
          newMessagesCount: newCount,
          oldMessagesCount: oldCount,
        };
      },
    );

    const connectionActivities = connections.map((conn) => {
      const isRequester = conn.requesterId === userId;
      const otherUser = isRequester ? conn.receiver : conn.requester;
      const userName = otherUser.profile?.firstName || otherUser.email;
      const text = `You connected with ${userName}`;
      return {
        type: 'connection',
        user: otherUser,
        date: conn.updatedAt,
        text,
      };
    });
    const allActivities = [...messageActivities, ...connectionActivities];
    allActivities.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });

    return allActivities.slice(0, limit);
  }
  async getProfileStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'profileStat',
        'profile',
        'receivedConnections',
        'sentConnections',
        'receivedMessages',
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const getIncomingConnection =
      await this.connectionService.getIncomingConnectionRequests(userId);
    const getOutgoingConnection =
      await this.connectionService.getOutgoingConnectionRequests(userId);

    const getConnectionsMe =
      await this.connectionService.getUserConnections(userId);

    const getRecentActivities = await this.getRecentActivityForUser(userId);

    console.log({
      getIncomingConnection,
      getOutgoingConnection,
      getConnectionsMe,
    });

    return {
      id: user.id,
      connections: {
        receivedConnections: user.sentConnections.map || 0,
        sentConnections: user.sentConnections?.length || 0,
        totalConnections:
          (user.receivedConnections?.length || 0) +
          (user.sentConnections?.length || 0),
        getIncomingConnection: getIncomingConnection.length || 0,
        getOutgoingConnection: getOutgoingConnection.length || 0,
        getConnectionsMe: getConnectionsMe.length || 0,
        getRecentActivities: getRecentActivities,
      },
      profileViews: {
        profileViews: user.profileViews,
      },
      messages: {
        messageCount: user.receivedMessages?.length || 0,
        unreadCount: user.receivedMessages?.filter((message) => !message.isRead)
          .length,
      },
    };
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
}
