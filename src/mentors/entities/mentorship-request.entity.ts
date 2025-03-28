import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor.entity';

@Entity()
export class MentorshipRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mentor, (mentor) => mentor.mentorshipRequests)
  mentor: Mentor;

  @Column()
  message: string;

  @Column({ nullable: true })
  durationInHours: number;

  @Column({ nullable: true })
  additionalDetails?: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'accepted', 'rejected'
}
