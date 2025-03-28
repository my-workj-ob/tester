import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorDto {
  @ApiProperty({ example: 'John Doe', description: 'Mentorning to‘liq ismi' })
  name: string;

  @ApiProperty({
    example: 'Senior Developer',
    description: 'Mentorning kasbiy unvoni',
  })
  title: string;

  @ApiProperty({
    example: 'TechCorp',
    description: 'Mentor ishlaydigan kompaniya',
  })
  company: string;

  @ApiProperty({
    type: [String],
    example: ['React', 'Node.js', 'TypeScript'],
    description: 'Mentorning egallagan texnologiyalari',
  })
  skills: string[];

  @ApiProperty({ example: 5, description: 'Mentorning tajribasi (yillarda)' })
  experienceYears: number;

  @ApiProperty({ example: 50, description: 'Mentorning soatlik narxi (USD)' })
  hourlyRate: number;

  @ApiProperty({
    example: 'Frontend Development',
    description: 'Mentorning asosiy mutaxassisligi',
  })
  expertise: string;

  @ApiProperty({
    required: false,
    example:
      'Experienced web developer specializing in modern frontend technologies.',
    description: 'Mentor haqida qisqacha ma’lumot',
  })
  bio?: string;

  @ApiProperty({
    required: false,
    example:
      'Looking for mentees passionate about JavaScript and UI/UX design.',
    description:
      'Mentor o‘z shogirdlaridan nimani kutishi haqida qisqacha yozuv',
  })
  expectations?: string;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Mentorning haftasiga necha soat ishlashi mumkinligi',
  })
  weeklyAvailability?: number;

  @ApiProperty({
    example: 'Hourly',
    description: 'Mentor narx strategiyasi (Fixed yoki Hourly)',
  })
  pricingOption: string;

  @ApiProperty({
    example: true,
    description: 'Mentor shartlarga rozi bo‘lganligini tasdiqlaydi',
  })
  termsAgreed: boolean;
}
