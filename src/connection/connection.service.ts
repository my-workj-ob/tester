import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Connection } from './entity/connection.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    private readonly usersService: UserService,
  ) {}

  async requestConnection(requesterId: number, receiverId: number) {
    if (requesterId === receiverId) {
      throw new ConflictException('O‘zingizga aloqa so‘rovi yubora olmaysiz.');
    }

    const receiver = await this.usersService.findById(receiverId);
    if (!receiver) {
      throw new NotFoundException(`Foydalanuvchi ${receiverId} topilmadi.`);
    }

    // Agar allaqachon so'rov mavjud bo'lsa yoki ular allaqachon bog'langan bo'lsa, xatolik qaytarish
    const existingConnection = await this.connectionsRepository.findOne({
      where: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existingConnection) {
      throw new ConflictException(
        'Ushbu foydalanuvchi bilan allaqachon aloqangiz bor yoki so‘rov yuborilgan.',
      );
    }

    const newConnectionRequest = this.connectionsRepository.create({
      requesterId,
      receiverId,
      status: 'pending', // So'rov holati - kutishda
    });

    return this.connectionsRepository.save(newConnectionRequest);

    // Kelajakda bildirishnoma yuborish logikasini qo'shish mumkin
  }

  // Aloqa so'rovlarini qabul qilish
  async acceptConnectionRequest(connectionId: number, userId: number) {
    const connectionRequest = await this.connectionsRepository.findOne({
      where: { id: connectionId, receiverId: userId, status: 'pending' },
    });

    if (!connectionRequest) {
      throw new NotFoundException(
        'Aloqa so‘rovi topilmadi yoki allaqachon qabul qilingan.',
      );
    }

    connectionRequest.status = 'accepted';
    return this.connectionsRepository.save(connectionRequest);
  }

  // Aloqa so'rovlarini rad etish
  async rejectConnectionRequest(connectionId: number, userId: number) {
    const connectionRequest = await this.connectionsRepository.findOne({
      where: { id: connectionId, receiverId: userId, status: 'pending' },
    });

    if (!connectionRequest) {
      throw new NotFoundException(
        'Aloqa so‘rovi topilmadi yoki allaqachon rad etilgan.',
      );
    }

    connectionRequest.status = 'rejected';
    return this.connectionsRepository.save(connectionRequest);
  }

  // Aloqani o'chirish
  async removeConnection(connectedUserId: number, userId: number) {
    const deleteResult = await this.connectionsRepository
      .createQueryBuilder()
      .delete()
      .from(Connection)
      .where(
        '(requesterId = :userId AND receiverId = :connectedUserId AND status = :accepted) OR (requesterId = :connectedUserId AND receiverId = :userId AND status = :accepted)',
        { userId, connectedUserId, accepted: 'accepted' },
      )
      .execute();

    if (deleteResult.affected === 0) {
      throw new NotFoundException(
        'Ushbu foydalanuvchi bilan aloqangiz topilmadi.',
      );
    }

    return { message: 'Aloqa o‘chirildi' };
  }

  // Foydalanuvchining aloqalarini olish
  async getUserConnections(userId: number): Promise<Connection[]> {
    return this.connectionsRepository.find({
      where: [
        { requesterId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' },
      ],
      relations: ['requester', 'receiver'], // Aloqador foydalanuvchi ma'lumotlarini yuklash
    });
  }

  // Foydalanuvchiga kelgan aloqa so'rovlarini olish
  async getIncomingConnectionRequests(userId: number): Promise<Connection[]> {
    return this.connectionsRepository.find({
      where: { receiverId: userId, status: 'pending' },
      relations: ['requester'], // So'rov yuboruvchi foydalanuvchi ma'lumotlarini yuklash
    });
  }

  // Foydalanuvchi yuborgan aloqa so'rovlarini olish
  async getOutgoingConnectionRequests(userId: number): Promise<Connection[]> {
    return this.connectionsRepository.find({
      where: { requesterId: userId, status: 'pending' },
      relations: ['receiver'], // So'rov qabul qiluvchi foydalanuvchi ma'lumotlarini yuklash
    });
  }
}
