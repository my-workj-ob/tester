import { Profile } from 'src/profile/entities/profile.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: number;

  @Column()
  entityType: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
  })
  user: User;
  @ManyToOne(() => Profile, (profile) => profile.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  profile: Profile;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
  })
  parentComment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: string;
  @Column({ default: 0 })
  likes: number;
}
