import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MentorshipRequest } from './mentorship-request.entity';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column('text', { array: true })
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
  @OneToMany(() => MentorshipRequest, (request) => request.mentor)
  mentorshipRequests: MentorshipRequest[];
}
