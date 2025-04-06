import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AssessmentResult } from './../../assessment-result/entities/assements-result.entity';
import { Skill } from './../../skill/entities/skill.entity';

@Entity()
export class Assessment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  skillName: string;

  @ApiProperty()
  @Column()
  duration: number;

  @ApiProperty()
  @Column()
  passingScore: number;

  @ApiProperty({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @Column({ type: 'enum', enum: ['Beginner', 'Intermediate', 'Advanced'] })
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';

  // Savollar va kod topshiriqlari uchun alohida entitylar yaratish tavsiya etiladi
  // Hozircha soddalik uchun ularni JSON sifatida saqlaymiz
  @ApiProperty({ type: 'number', isArray: true })
  @Column({ type: 'jsonb', nullable: true })
  questionIds: number[];

  @ApiProperty({ type: 'number', isArray: true })
  @Column({ type: 'jsonb', nullable: true })
  codingChallengeIds: number[];

  @OneToMany(
    () => AssessmentResult,
    (assessmentResult) => assessmentResult.assessment,
  )
  results: AssessmentResult[];

  @ManyToOne(() => Skill, (skill) => skill.id)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @ApiProperty()
  @Column()
  skillId: number; // Tashqi kalit
  @ApiProperty({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
