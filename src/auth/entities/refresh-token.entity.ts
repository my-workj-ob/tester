import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
    eager: true,
  }) // 👈 `eager: true` qo‘shildi
  @JoinColumn({ name: 'userId' })
  user: User;
  // s
  @CreateDateColumn()
  createdAt: Date;
}
