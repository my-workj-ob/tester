import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  receiver: User;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean; // O‘qilgan yoki yo‘qligini ko‘rsatish uchun

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
  createQueryBuilder: any;

  @Column({ type: 'int', default: 0 }) // New column for unread count
  unreadCount: number;
}
