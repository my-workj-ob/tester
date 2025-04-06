import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Assessment } from './../../assessments/entities/assessments.entity';
import { CodingSubmission } from './../../coding-submission/entities/coding-submission.entity';

@Entity()
export class AssessmentResult {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.assessmentResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  userId: number; // Tashqi kalit

  @ManyToOne(() => Assessment, (assessment) => assessment.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessment;

  @ApiProperty()
  @Column()
  assessmentId: number; // Tashqi kalit

  @ApiProperty()
  @Column()
  score: number; // Olingan ball (ehtimol foizda yoki absolyut qiymatda)

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  answers: any[]; // Foydalanuvchi tomonidan berilgan javoblar (savol IDsi -> tanlangan javob indeksi)

  @ApiProperty()
  @Column({ default: false })
  passed: boolean; // Baholashdan o'tgan yoki o'tmaganligi

  @ApiProperty({ type: 'number', isArray: true })
  @Column({ type: 'jsonb', nullable: true })
  questionIds: number[];

  // Kod topshiriqlari uchun IDlar massivi
  @ApiProperty({ type: 'number', isArray: true })
  @Column({ type: 'jsonb', nullable: true })
  codingChallengeIds: number[];

  @OneToMany(() => CodingSubmission, (submission) => submission.assessment) // Aloqa
  submissions: CodingSubmission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
