import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGateway } from './chatgateway';
import { Block } from './entities/block-user.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    private chatGateway: ChatGateway, // Inject the ChatGateway
  ) {}

  async isBlocked(senderId: number, receiverId: number) {
    const block = await this.blockRepo.findOne({
      where: [
        { blocker: { id: senderId }, blocked: { id: receiverId } },
        { blocker: { id: receiverId }, blocked: { id: senderId } },
      ],
    });
    return !!block;
  }
}
