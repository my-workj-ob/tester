import { ApiProperty } from '@nestjs/swagger';

export class ExploreUserResponseDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Lisa Patel' })
  name: string;

  @ApiProperty({ example: ['Agile', 'Product Strategy', 'User Stories'] })
  skills: string[];

  @ApiProperty({ example: 72 })
  matchPercentage: number;

  @ApiProperty({ example: 'pending' })
  status: string[];
}
