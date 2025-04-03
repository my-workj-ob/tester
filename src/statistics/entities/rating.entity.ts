import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './../../portfolio/entities/project.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  score: number;

  @ManyToOne(() => Project, (project) => project.ratings)
  project: Project;
  value: number;
}
