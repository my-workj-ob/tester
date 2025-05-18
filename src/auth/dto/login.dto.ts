/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ADMIN@gmail.com', description: 'Email manzili' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin', description: 'Parol' })
  @IsNotEmpty()
  password: string;
}
