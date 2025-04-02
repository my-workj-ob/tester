import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './../../skill/entities/skill.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique ID of the category' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'Category name (e.g., Technical, Soft Skills)' })
  name: string;

  @OneToMany(() => Skill, (skill) => skill.category)
  @ApiProperty({
    description: 'Skills that belong to this category',
    type: () => [Skill],
  })
  skills: Skill[];
}
