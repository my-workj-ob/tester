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
// s
import { Session } from '../../security/entities/session.entity';
import { AssessmentResult } from './../../assessment-result/entities/assements-result.entity';
import { Block } from './../../chat/entities/block-user.entity';
import { Message } from './../../chat/entities/chat.entity';
import { CodingSubmission } from './../../coding-submission/entities/coding-submission.entity';
import { Comment } from './../../comments/entities/comments.entity';
import { Connection } from './../../connection/entity/connection.entity';
import { Job } from './../../jobs/entity/jobs.entity';
import { Like } from './../../like/entities/like.entity';
import { Mentor } from './../../mentors/entities/mentor.entity';
import { MentorshipRequest } from './../../mentors/entities/mentorship-request.entity';
import { Notification } from './../../notification/entities/notification.entity';
import { Skill } from './../../skill/entities/skill.entity';
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

  @OneToMany(() => User, (user) => user.mentorshipRequests)
  mentorshipRequests: MentorshipRequest[]; // 🔥 Mentee bog‘lanishi qo‘shildi

  @OneToMany(
    () => AssessmentResult,
    (assessmentResult) => assessmentResult.user,
  )
  assessmentResults: AssessmentResult[];
  @OneToMany(() => Skill, (skill) => skill.user)
  skills: Skill[];

  @OneToMany(() => CodingSubmission, (submission) => submission.user, {
    cascade: true, // optional
  })
  codingSubmissions: CodingSubmission[];

  @OneToMany(() => Job, (job) => job.employer)
  jobs: Job[];
  @OneToMany(() => Connection, (connection) => connection.receiver)
  receivedConnections: Connection[];

  @OneToMany(() => Connection, (connection) => connection.requester)
  sentConnections: Connection[];
  @OneToMany(() => Notification, (connection) => connection.user)
  notifications: Notification[];
  @Column({ default: 0 }) // Qo'shilgan ustun
  profileViews: number;
  @OneToMany(() => Block, (block) => block.blocker)
  blockedUsers: Block[];
  // user.entity.ts
  @Column({ nullable: true, type: 'text' })
  publicKey: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Agar yo'q bo'lsa, qo'shing
  updatedAt: Date;
}
