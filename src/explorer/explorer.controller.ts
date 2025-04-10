/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { ExploreUserWithSkillsDto } from './dto/explore-users-with-skill.dto';
import { ExploreService } from './explorer.service';

@Controller('explore')
@ApiTags('Explore')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Foydalanuvchi avtorizatsiyadan o‘tmagan',
})
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get()
  @ApiOkResponse({
    description: 'Barcha foydalanuvchilar ro‘yxati (moslik bilan)',
    type: [ExploreUserWithSkillsDto],
  })
  async exploreUsers(@Req() req) {
    const currentUser = req.user.userId as number;
    return this.exploreService.getExploreUsers(currentUser);
  }
}
