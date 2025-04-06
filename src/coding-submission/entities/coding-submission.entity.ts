import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Assessment } from './../../assessments/entities/assessments.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity()
export class CodingSubmission {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.codingSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  userId: number; // Tashqi kalit

  @ManyToOne(() => Assessment, (assessment) => assessment.codingChallengeIds, {
    // E'tibor bering: aloqa
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessment;

  @ApiProperty()
  @Column()
  assessmentId: number; // Tashqi kalit

  @ApiProperty()
  @Column({ type: 'text' })
  code: string;

  @ApiProperty({ enum: SubmissionStatus, default: SubmissionStatus.PENDING })
  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  result?: string; // Test natijalari yoki xatolik xabari

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
