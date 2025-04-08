import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionService } from 'src/connection/connection.service';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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
    // Qaytarish tipi o'zgartirildi
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['skills', 'profile'],
    });

    if (!currentUser || !currentUser.skills) {
      return [];
    }

    const allUsers = await this.userRepository.find({
      relations: ['skills', 'profile'],
    });

    const connections =
      await this.connectionService.getUserConnections(currentUserId);
    const connectedUserIds = connections.map((conn) =>
      conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId,
    );

    const exploreUsers: ExploreUserWithSkillsDto[] = []; // Javob massivi tipi o'zgartirildi

    for (const otherUser of allUsers) {
      if (
        otherUser.id !== currentUserId &&
        !connectedUserIds.includes(otherUser.id)
      ) {
        const matchPercentage = this.calculateMatchPercentage(
          currentUser.skills.map((s) => s.name),
          otherUser.skills.map((s) => s.name),
        );

        exploreUsers.push({
          id: otherUser.id,
          name: otherUser.profile.firstName,
          skills: otherUser.skills.map((s) => s.name),
          matchPercentage,
        });
      }
    }
    console.log(allUsers);

    return exploreUsers.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}
