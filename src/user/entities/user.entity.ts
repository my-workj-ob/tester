import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Project } from 'src/portfolio/entities/project.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Comment } from 'src/comments/entities/comments.entity';
import { Like } from 'src/like/entities/like.entity';
import { Mentor } from 'src/mentors/entities/mentor.entity';
import { Session } from '../../security/entities/session.entity';

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
}
