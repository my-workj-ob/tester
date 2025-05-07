/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { BlockService } from './block.service';

@Controller('block')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  async blockUser(@Req() req, @Body() body: { blockedId: number }) {
    const blockerId = req?.user?.userId; // JWT'dan user ID olinyapti
    const { blockedId } = body;
    return this.blockService.blockUser(blockerId, blockedId);
  }

  @Post('unblock')
  async unblockUser(@Req() req, @Body() body: { blockedId: number }) {
    const blockerId = req?.user?.userId;
    const { blockedId } = body;
    return this.blockService.unblockUser(blockerId, blockedId);
  }
}
