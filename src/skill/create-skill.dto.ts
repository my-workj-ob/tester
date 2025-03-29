import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'JavaScript' })
  category: string;

  @ApiProperty({ example: 1, description: 'Category ID' }) // ✅ categoryId orqali yuboriladi
  categoryId: number;

  @ApiProperty({ description: 'Skill name', example: 'JavaScript' })
  name: string;

  @ApiProperty({ description: 'Whether the skill is public', example: true })
  isPublic: boolean;
  @ApiProperty({
    description: 'Whether the skill is isVerified',
    example: true,
  })
  isVerified: boolean;
}
