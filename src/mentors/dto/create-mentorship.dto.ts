import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorshipRequestDto {
  @ApiProperty()
  menteeName: string;

  @ApiProperty()
  menteeEmail: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  mentorId: number;
}
