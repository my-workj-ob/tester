import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { MentorshipRequest } from './mentorship-request.entity';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column()
  experienceYears: number;

  @Column({ default: false })
  verified: boolean;

  @Column()
  hourlyRate: number;

  @Column({ nullable: true })
  expertise: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('text', { nullable: true })
  expectations: string;

  @Column({ nullable: true })
  weeklyAvailability: number;

  @Column({ nullable: true })
  pricingOption: string;
  @Column({ default: false })
  termsAgreed: boolean;
  @Column({ nullable: true })
  userId: number;
  @OneToMany(() => MentorshipRequest, (request) => request.mentor)
  mentorshipRequests: MentorshipRequest[];

  @ManyToOne(() => User, (user) => user.mentors, { onDelete: 'CASCADE' })
  user: User;
}
