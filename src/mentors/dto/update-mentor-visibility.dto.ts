import { IsBoolean } from 'class-validator';

export class UpdateMentorVisibilityDto {
  @IsBoolean()
  isPrivate: boolean;
}
