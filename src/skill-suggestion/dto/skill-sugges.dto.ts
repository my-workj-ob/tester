import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SuggestSkillDto {
  @ApiProperty({ description: "Taklif qilinayotgan ko'nikmaning nomi" })
  @IsNotEmpty()
  @IsString()
  name: string;
}
