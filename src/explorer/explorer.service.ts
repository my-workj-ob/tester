import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionService } from './../connection/connection.service';
import { User } from './../user/entities/user.entity';
import { ExploreUserWithSkillsDto } from './dto/explore-users-with-skill.dto';

@Injectable()
export class ExploreService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly connectionService: ConnectionService,
  ) {}

  calculateMatchPercentage(
    currentUserSkills: string[],
    otherUserSkills: string[],
  ): number {
    if (
      !currentUserSkills ||
      !otherUserSkills ||
      currentUserSkills.length === 0 ||
      otherUserSkills.length === 0
    ) {
      return 0;
    }

    const commonSkills = currentUserSkills.filter((skillName) =>
      otherUserSkills.includes(skillName.toLowerCase().trim()),
    );
    return parseFloat(
      (
        (commonSkills.length /
          Math.max(currentUserSkills.length, otherUserSkills.length)) *
        100
      ).toFixed(2),
    );
  }

  async getExploreUsers(
    currentUserId: number,
  ): Promise<ExploreUserWithSkillsDto[]> {
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['skills', 'profile'],
    });

    if (!currentUser || !currentUser.skills) {
      return [];
    }

    const allUsers = await this.userRepository.find({
      relations: [
        'skills',
        'profile',
        'receivedConnections',
        'sentConnections',
      ],
    });

    // const connections =
    //   await this.connectionService.getUserConnections(currentUserId);
    // const connectedUserIds = connections.map((conn) =>
    //   conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId,
    // );

    const exploreUsers: ExploreUserWithSkillsDto[] = [];

    for (const otherUser of allUsers) {
      if (otherUser.id !== currentUserId) {
        const matchPercentage = this.calculateMatchPercentage(
          currentUser.skills.map((s) => s.name),
          otherUser.skills.map((s) => s.name),
        );

        let connectionStatus: string | null = null;

        // Joriy foydalanuvchi bilan aloqa statusini tekshirish (kiruvchi so'rovlar)
        const receivedConnection = otherUser.receivedConnections.find(
          (conn) => conn.requesterId === currentUserId,
        );
        if (receivedConnection) {
          connectionStatus = receivedConnection.status;
        }

        // Joriy foydalanuvchi bilan aloqa statusini tekshirish (chiquvchi so'rovlar)
        const sentConnection = otherUser.sentConnections.find(
          (conn) => conn.receiverId === currentUserId,
        );
        if (sentConnection) {
          connectionStatus = sentConnection.status;
        }

        exploreUsers.push({
          id: otherUser.id,
          firstName: otherUser.profile.firstName,
          profile: otherUser.profile,
          status: connectionStatus ? connectionStatus : 'connect',
          skills: otherUser.skills.map((s) => s.name),

          matchPercentage,
        });
      }
    }

    return exploreUsers.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}
