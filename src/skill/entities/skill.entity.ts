import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { Category } from './../../category/entities/category.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique ID of the skill' })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Skill name (e.g., JavaScript, React, Teamwork)',
  })
  name: string;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Number of endorsements', example: 10 })
  endorsements: number;

  @Column({ default: 0 })
  @ApiProperty({
    description: 'Calculated percentage based on endorsements',
    example: 75,
  })
  percentage: number;

  @ManyToOne(() => Profile, (profile) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => [Skill] }) // 🛠 Lazy resolver qo‘shildi
  @ApiProperty({ description: 'The profile that owns this skill' })
  profile: Profile;
  @Column()
  profileId: number; // ✅ Profile ID'sini saqlash

  @ManyToOne(() => Category, (category) => category.skills, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'Category of this skill' })
  category: Category;

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether the skill is owned by the profile',
    example: true,
  })
  ownSkill: boolean;

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether the skill is public or private',
    example: true,
  })
  isPublic: boolean;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether the skill is verified', example: false })
  isVerified: boolean;
}
