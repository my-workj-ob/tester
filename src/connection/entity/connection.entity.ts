import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('connections')
export class Connection {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column()
  requesterId: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.sentConnections)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ApiProperty({ example: 2 })
  @Column()
  receiverId: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.receivedConnections)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @ApiProperty({
    enum: ['pending', 'accepted', 'rejected'],
    example: 'pending',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
