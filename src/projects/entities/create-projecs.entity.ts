import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Projects {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  categoryId: number;

  @Column()
  description: string;

  @Column('simple-array')
  technologies: string[];

  @Column('text', { array: true, nullable: true }) // yoki jsonb ham qolsa bo‘ladi
  images: string[];

  @ManyToOne(() => User, (user) => user.project, { eager: true })
  user: User;
  
  @Column({ nullable: true })
  @ApiProperty({ example: 1, description: 'userId' })
  userId?: number;
  @ManyToOne(() => Category, (category) => category.project, { eager: true })
  category: Category;

  @Column()
  deadline: Date;

  @Column({ nullable: true })
  teamSize?: number;

  @Column('simple-array', { nullable: true })
  openPositions?: string[];

  @Column({ default: 'Planning' })
  status?: string;
}
