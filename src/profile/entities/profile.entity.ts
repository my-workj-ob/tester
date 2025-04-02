import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './../../comments/entities/comments.entity';
import { Project } from './../../portfolio/entities/project.entity';
import { Skill } from './../../skill/entities/skill.entity';
import { User } from './../../user/entities/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.profile, {
    onDelete: 'CASCADE',
  })
  skills: Skill[];

  @OneToMany(() => Project, (project) => project.profile, { cascade: true })
  projects: Project[];

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.profile, { cascade: true })
  comments: Comment[];
}
