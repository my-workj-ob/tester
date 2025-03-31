/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LikeService } from './like.service';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/:id/like')
  async toggleLike(@Param('id') commentId: number, @Req() req) {
    const userId = req.user?.userId;
    console.log('commentIds:', commentId);
    console.log('userId:', userId);
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.likeService.toggleLike(commentId, userId);
  }
}
