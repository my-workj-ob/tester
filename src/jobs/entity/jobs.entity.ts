import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyWebsite: string;

  @Column({
    type: 'enum',
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
  })
  jobType: string;

  @Column({ type: 'varchar', length: 255 })
  experienceLevel: string;

  @Column({ type: 'enum', enum: ['Remote', 'On-site', 'Hybrid'] })
  locationType: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'integer', nullable: true })
  salaryMin: number;

  @Column({ type: 'integer', nullable: true })
  salaryMax: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  salaryPeriod: string; // 'year', 'month', va h.k.

  @Column({ type: 'date', nullable: true })
  applicationDeadline: Date;

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: string[]) => (value ? value.join(',') : null),
      from: (value: string) => (value ? value.split(',') : null),
    },
  })
  requiredSkills: string[];

  @Column({ type: 'text' })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  applicationInstructions: string;

  @Column({ type: 'boolean', default: false })
  enableEasyApply: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'integer' })
  employerId: number;

  @ManyToOne(() => User, (user) => user.jobs)
  @JoinColumn({ name: 'employerId' })
  employer: User;
}
