import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshToken } from './../../auth/entities/refresh-token.entity';
import { Project } from './../../portfolio/entities/project.entity';
import { Profile } from './../../profile/entities/profile.entity';

import { Message } from 'src/chat/entities/chat.entity';
import { Session } from '../../security/entities/session.entity';
import { Comment } from './../../comments/entities/comments.entity';
import { Like } from './../../like/entities/like.entity';
import { Mentor } from './../../mentors/entities/mentor.entity';
import { ProfileStat } from './profile-stat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  // ✅ Comment bilan bog‘lanish
  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];
  @ManyToMany(() => Project, (project) => project.likes)
  likedProjects: Project[];

  @OneToMany(() => Like, (like) => like.user, { cascade: true })
  likes: Like[];

  @OneToMany(() => Mentor, (mentor) => mentor.user, { cascade: true })
  mentors: Mentor[];
  @OneToOne(() => ProfileStat)
  @JoinColumn()
  profileStat: ProfileStat;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];
}
