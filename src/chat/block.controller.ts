/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { BlockService } from './block.service';

@Controller('block')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}
}
