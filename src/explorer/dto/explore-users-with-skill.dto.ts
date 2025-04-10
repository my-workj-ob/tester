import { ApiProperty } from '@nestjs/swagger';
import { Profile } from './../../profile/entities/profile.entity';

export class ExploreUserWithSkillsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  firstName: string;
  @ApiProperty({ example: 'John Doe', type: Profile })
  profile: Profile;

  @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'] })
  skills: string[];

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 95 })
  matchPercentage: number;
}
