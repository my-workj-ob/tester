import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assessment } from './../../assessments/entities/assessments.entity';
import { Category } from './../../category/entities/category.entity';
import { Skill } from './../../skill/entities/skill.entity';

@Entity()
export class Question {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  text: string;

  @ApiProperty({ type: 'string', isArray: true })
  @Column({ type: 'jsonb' })
  options: string[];

  @ApiProperty()
  @Column()
  correctAnswer: number;

  @ManyToOne(() => Skill, (skill) => skill.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillId' })
  skill?: Skill;

  @ApiProperty()
  @Column({ nullable: true })
  skillId?: number;

  @ManyToOne(() => Category, (category) => category.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category; // Yangi aloqa

  @ApiProperty()
  @Column({ type: 'number', nullable: true })
  categoryId: number; // Yangi tashqi kalit

  @OneToMany(() => Assessment, (assessment) => assessment.id)
  assessments: Assessment[];
}
