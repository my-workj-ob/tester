import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './../../portfolio/entities/project.entity';
import { Question } from './../../questions/entities/question.entity';
import { Skill } from './../../skill/entities/skill.entity';
import { Projects } from 'src/projects/entities/create-projecs.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Kategoriyaning noyob IDsi' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: "Kategoriya nomi (masalan, Texnik, Yumshoq Ko'nikmalar)",
  })
  name: string;

  @OneToMany(() => Project, (project) => project.category) // Bog'lanishning qarama-qarshi (inverse) tomoni
  projects: Project[]; // Bu kategoriyaga tegishli bo'lgan Project'lar massivini saqlaydigan maydon.
  // Bu maydon uchun bazada alohida ustun yaratilmaydi.

  @OneToMany(() => Skill, (skill) => skill.category)
  @ApiProperty({
    description: "Ushbu kategoriyaga tegishli ko'nikmalar",
    type: () => [Skill],
  })
  skills: Skill[];

  @ApiProperty({
    type: 'number',
    nullable: true,
    description: 'Ota kategoriya IDsi',
  })
  @Column({ nullable: true })
  parentId?: number | null;

  @OneToMany(() => Projects, (project) => project.category)
  project: Projects[];

  @ApiProperty({
    type: () => Category,
    nullable: true,
    description: 'Ota kategoriya',
  })
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @ApiProperty({
    type: () => Category,
    isArray: true,
    description: 'Bola kategoriyalar',
  })
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Question, (question) => question.category)
  questions: Question[]; // Har bir categoryga tegishli bo'lgan savollar
}
