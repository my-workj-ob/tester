import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorDto {
  @ApiProperty({ example: 'Senior Developer', description: 'Kasbiy unvon' })
  title: string;

  @ApiProperty({ example: 'TechCorp', description: 'Ish joyi' })
  company: string;

  @ApiProperty({ type: [String], example: ['React', 'Node.js'] })
  skills: string[];

  @ApiProperty({ example: 5, description: 'Tajribasi (yillarda)' })
  experienceYears: number;

  @ApiProperty({ example: 50, description: 'Soatlik narx (USD)' })
  hourlyRate: number;

  @ApiProperty({ example: 'Frontend Development' })
  expertise: string;

  @ApiProperty({ required: false, example: 'Senior frontend dev' })
  bio?: string;

  @ApiProperty({ required: false, example: 'Looking for JS mentees' })
  expectations?: string;

  @ApiProperty({ required: false, example: 10 })
  weeklyAvailability?: number;

  @ApiProperty({ example: 'Hourly' })
  pricingOption: string;

  @ApiProperty({ example: true })
  termsAgreed: boolean;

  @ApiProperty({ example: 1, description: 'User ID' }) // ✅ To‘g‘ri bog‘lash
  userId: number;
}
