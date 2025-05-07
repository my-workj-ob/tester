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

  async blockUser(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) throw new Error('You cannot block yourself');

    // Check if the user has already blocked the other user
    const exists = await this.blockRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (exists) return { message: 'Already blocked' };

    // Create a new block record
    const block = this.blockRepo.create({
      blocker: { id: blockerId },
      blocked: { id: blockedId },
    });
    await this.blockRepo.save(block);

    // Emit socket event to notify the blocking action
    this.chatGateway.server.emit('userBlocked', { blockerId, blockedId });

    return { success: true };
  }

  async unblockUser(blockerId: number, blockedId: number) {
    // Remove the block record from the database
    await this.blockRepo.delete({
      blocker: { id: blockerId },
      blocked: { id: blockedId },
    });

    // Emit socket event to notify the unblocking action
    this.chatGateway.server.emit('userUnblocked', { blockerId, blockedId });

    return { success: true };
  }

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
