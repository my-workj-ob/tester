import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ProfileStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  content: string;

  @Column()
  date: string;

  @Column()
  likes: number;

  @Column()
  replies: number;
}
