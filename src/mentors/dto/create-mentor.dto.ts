import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorDto {
  @ApiProperty({
    required: false,
    example: 'Senior Developer',
    description: 'Kasbiy unvon',
  })
  title?: string;

  @ApiProperty({
    required: false,
    example: 'TechCorp',
    description: 'Ish joyi',
  })
  company?: string;

  @ApiProperty({
    required: false,
    type: [String],
    example: ['React', 'Node.js'],
  })
  skills?: string[];

  @ApiProperty({
    required: false,
    example: 5,
    description: 'Tajribasi (yillarda)',
  })
  experienceYears?: number;

  @ApiProperty({
    required: false,
    example: 50,
    description: 'Soatlik narx (USD)',
  })
  hourlyRate?: number;

  @ApiProperty({ required: false, example: 'Frontend Development' })
  expertise?: string;

  @ApiProperty({ required: false, example: 'Senior frontend dev' })
  bio?: string;

  @ApiProperty({ required: false, example: 'Looking for JS mentees' })
  expectations?: string;

  @ApiProperty({ required: false, example: 10 })
  weeklyAvailability?: number;

  @ApiProperty({ required: false, example: 'Hourly' })
  pricingOption?: string;

  @ApiProperty({ required: false, example: true })
  termsAgreed?: boolean;

  @ApiProperty({ required: false, example: 1, description: 'User ID' })
  userId?: number;
}
