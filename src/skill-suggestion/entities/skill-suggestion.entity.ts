import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SkillSuggestion {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Taklif qilingan ko'nikmaning nomi" })
  @Column()
  name: string;

  @ApiProperty({ description: 'Taklif qilingan sana' })
  @CreateDateColumn()
  createdAt: Date;
}
