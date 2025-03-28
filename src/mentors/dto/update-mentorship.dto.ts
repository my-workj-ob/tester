import { IsString } from 'class-validator';

export class UpdateMentorshipStatusDto {
  @IsString()
  status: 'accepted' | 'rejected';
}
