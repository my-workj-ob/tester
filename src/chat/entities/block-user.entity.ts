import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// entities/block.entity.ts
@Entity()
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  blocker: User;

  @ManyToOne(() => User)
  blocked: User;

  @CreateDateColumn()
  createdAt: Date;
}
