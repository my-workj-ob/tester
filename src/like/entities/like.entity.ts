import { Comment } from 'src/comments/entities/comments.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' }) // ❌ `likesCount` emas!
  comment: Comment;
}
