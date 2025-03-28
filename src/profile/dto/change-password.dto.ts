import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Joriy parol' })
  @IsNotEmpty({ message: 'Joriy parol talab qilinadi' })
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePass456', description: 'Yangi parol' })
  @IsNotEmpty({ message: 'Yangi parol talab qilinadi' })
  @MinLength(6, {
    message: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak',
  })
  newPassword: string;
}
