import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';

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
