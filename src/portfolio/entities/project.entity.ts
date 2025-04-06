import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './../../category/entities/category.entity';
import { Profile } from './../../profile/entities/profile.entity';
import { Rating } from './../../statistics/entities/rating.entity';
import { User } from './../../user/entities/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Loyiha ID raqami' })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ example: 'E-commerce Website', description: 'Loyiha nomi' })
  title: string;

  @ManyToOne(() => Category, (category) => category.projects, {
    onDelete: 'SET NULL', // Ixtiyoriy: Agar bog'langan Kategoriya o'chirilsa nima qilish kerakligi
    // 'SET NULL' - Bu loyihadagi categoryId ni NULL qiladi
    // 'CASCADE' - Kategoriya o'chirilsa, bog'liq loyihalarni ham o'chiradi
    // 'RESTRICT' - Agar loyiha bog'liq bo'lsa, kategoriyani o'chirishga yo'l qo'ymaydi
  })
  category: Category; // Bog'langan Category ob'ektini saqlaydigan maydon.
  // TypeORM avtomatik ravishda 'categoryId' nomli tashqi kalit (foreign key) ustunini yaratadi.

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

  @OneToMany(() => Rating, (ratings) => ratings.project)
  ratings: Rating[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  }) // Avtomatik ravishda yaratilish vaqtini qo'yadi
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  }) // Avtomatik ravishda yangilanish vaqtini qo'yadi
  updatedAt: Date;
}
