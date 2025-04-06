import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateAssessmentResultDto {
  @ApiProperty({ description: 'Olingan ball (ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    description:
      'Foydalanuvchi javoblari (savol IDsi -> javob indeksi, ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  answers?: any[];

  @ApiProperty({
    description: "Baholashdan o'tdimi yoki yo'q (ixtiyoriy)",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  passed?: boolean;
}
