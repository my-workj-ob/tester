import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConnectionRequestDto {
  @ApiProperty({
    description: 'Aloqa so‘rovi qabul qiluvchi foydalanuvchining IDsi',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;
}
