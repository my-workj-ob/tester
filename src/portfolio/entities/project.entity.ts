import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './../../profile/entities/profile.entity';
import { User } from './../../user/entities/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Loyiha ID raqami' })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ example: 'E-commerce Website', description: 'Loyiha nomi' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example:
      'A fully responsive e-commerce platform built with Next.js and Tailwind CSS',
    description: 'Loyiha tavsifi',
  })
  description: string;

  @Column('simple-array', { nullable: true })
  @ApiProperty({
    example: ['Next.js', 'React', 'Tailwind CSS'],
    description: 'Loyihaga tegishli texnologiyalar',
  })
  tags: string[];

  @Column({ nullable: true })
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Loyiha rasmi uchun URL',
  })
  imageUrl: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Profile, (profile) => profile.projects, {
    onDelete: 'CASCADE',
  })
  profile: Profile;

  @Column({ nullable: true })
  @ApiProperty({ example: 1, description: 'userId' })
  userId?: number;

  @Column({ default: 0 })
  views: number;
  @Column({ default: 0 })
  ownProduct: boolean;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column('jsonb', { nullable: true })
  images: { url: string; isMain: boolean }[];

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  liveDemoUrl: string;

  @Column({ default: true })
  ownProject: boolean;

  @ManyToMany(() => User, (user) => user.likedProjects)
  @JoinTable()
  likes: User[];
}
