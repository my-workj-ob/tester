import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './../../category/entities/category.entity';
import { Profile } from './../../profile/entities/profile.entity';
import { Question } from './../../questions/entities/question.entity';
import { User } from './../../user/entities/user.entity';

export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  NOT_VERIFIED = 'not_verified',
}

@Entity()
export class Skill {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.skills, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Profile, (profile) => profile.skills)
  profile: Profile;

  @ApiProperty({
    enum: VerificationStatus,
    default: VerificationStatus.NOT_VERIFIED,
  })
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NOT_VERIFIED,
  })
  verificationStatus: VerificationStatus;

  @ManyToOne(() => User, (user) => user.skills)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column({ nullable: true })
  userId: number;

  @OneToMany(() => Question, (question) => question.skill)
  questions: Question[];

  @ApiProperty()
  categoryId: number;
}
