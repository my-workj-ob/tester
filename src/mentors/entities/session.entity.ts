import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mentor)
  mentor: Mentor;

  @Column()
  menteeName: string;

  @Column()
  menteeEmail: string;

  @Column()
  sessionDate: Date;
}
