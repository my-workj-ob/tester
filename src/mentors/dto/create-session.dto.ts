import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty()
  mentorId: number;

  @ApiProperty()
  menteeName: string;

  @ApiProperty()
  menteeEmail: string;

  @ApiProperty({ type: Date })
  sessionDate: Date;
}
