import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SkillDto {
  @IsString()
  @ApiProperty({ example: 'name', description: 'Frontend' })
  name: string;
}
