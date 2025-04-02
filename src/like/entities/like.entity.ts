import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './../../comments/entities/comments.entity';
import { User } from './../../user/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' }) // ❌ `likesCount` emas!
  comment: Comment;
}
