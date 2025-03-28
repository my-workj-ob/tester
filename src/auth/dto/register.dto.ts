/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'Foydalanuvchi ismi' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Foydalanuvchi familiyasi' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email manzili' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Parol',
    minLength: 6,
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Parolni tasdiqlash',
  })
  @IsNotEmpty()
  confirmPassword: string;
  jobTitle?: string;
}
