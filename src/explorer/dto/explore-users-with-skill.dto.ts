import { ApiProperty } from '@nestjs/swagger';

export class ExploreUserWithSkillsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'] })
  skills: string[];

  @ApiProperty({ example: 85 })
  matchPercentage: number;
}
