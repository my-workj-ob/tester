import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationGateway } from './../notification/notificationGateway';
import { UserService } from './../user/user.service';
import { Connection } from './entity/connection.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    private readonly usersService: UserService,
    private readonly notificationGateway: NotificationGateway, // NotificationGateway injeksiya qilindi
  ) {}

  async requestConnection(requesterId: number, receiverId: number) {
    console.log(
      `[ConnectionService] Aloqa so'rovi: Yuboruvchi: ${requesterId}, Qabul qiluvchi: ${receiverId}`,
    );
    if (requesterId === receiverId) {
      console.warn(
        `[ConnectionService] O'ziga aloqa so'rovi yuborishga urinish: Foydalanuvchi ID: ${requesterId}`,
      );
      throw new ConflictException('O‘zingizga aloqa so‘rovi yubora olmaysiz.');
    }

    const receiver = await this.usersService.findById(receiverId);
    if (!receiver) {
      console.error(
        `[ConnectionService] Qabul qiluvchi topilmadi: ID: ${receiverId}`,
      );
      throw new NotFoundException(`Foydalanuvchi ${receiverId} topilmadi.`);
    }

    const requester = await this.usersService.findById(requesterId);
    if (!requester) {
      console.error(
        `[ConnectionService] Yuboruvchi topilmadi: ID: ${requesterId}`,
      );
      throw new NotFoundException(`Foydalanuvchi ${requesterId} topilmadi.`);
    }

    const existingConnection = await this.connectionsRepository.findOne({
      where: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existingConnection) {
      console.warn(
        `[ConnectionService] Allaqachon aloqa mavjud yoki so'rov yuborilgan: Yuboruvchi: ${requesterId}, Qabul qiluvchi: ${receiverId}`,
      );
      throw new ConflictException(
        'Ushbu foydalanuvchi bilan allaqachon aloqangiz bor yoki so‘rov yuborilgan.',
      );
    }

    const newConnectionRequest = this.connectionsRepository.create({
      requesterId,
      receiverId,
      status: 'pending',
    });

    try {
      const savedConnection =
        await this.connectionsRepository.save(newConnectionRequest);
      console.log(
        `[ConnectionService] Aloqa so'rovi yaratildi. ID: ${savedConnection.id}, Yuboruvchi: ${requesterId}, Qabul qiluvchi: ${receiverId}`,
      );
      await this.notificationGateway.pushAndSave(
        receiverId,
        'CONNECTION_REQUEST',
        `${requester.profile?.firstName || requester.email} sizga aloqa so‘rovi yubordi.`,
      );
      return savedConnection;
    } catch (error) {
      console.error(
        `[ConnectionService] Aloqa so'rovini saqlashda xatolik:`,
        error,
      );
      throw error;
    }
  }

  async acceptConnectionRequest(connectionId: number, userId: number) {
    console.log(
      `[ConnectionService] Aloqa so'rovini qabul qilish: ID: ${connectionId}, Qabul qiluvchi ID: ${userId}`,
    );
    const connectionRequest = await this.connectionsRepository.findOne({
      where: { id: connectionId, receiverId: userId, status: 'pending' },
      relations: ['requester', 'receiver'],
    });

    if (!connectionRequest) {
      console.warn(
        `[ConnectionService] Aloqa so'rovi topilmadi yoki allaqachon qabul qilingan: ID: ${connectionId}, Qabul qiluvchi ID: ${userId}`,
      );
      throw new NotFoundException(
        'Aloqa so‘rovi topilmadi yoki allaqachon qabul qilingan.',
      );
    }

    connectionRequest.status = 'accepted';
    try {
      const updatedConnection =
        await this.connectionsRepository.save(connectionRequest);
      console.log(
        `[ConnectionService] Aloqa so'rovi qabul qilindi. ID: ${updatedConnection.id}, Yuboruvchi: ${connectionRequest.requesterId}, Qabul qiluvchi: ${connectionRequest.receiverId}`,
      );
      await this.notificationGateway.pushAndSave(
        connectionRequest.requesterId,
        'ACCEPTED',
        `${connectionRequest.receiver.profile?.firstName || connectionRequest.receiver.email} sizning aloqa so‘rovingizni qabul qildi.`,
      );
      return updatedConnection;
    } catch (error) {
      console.error(
        `[ConnectionService] Aloqa so'rovini qabul qilishni saqlashda xatolik:`,
        error,
      );
      throw error;
    }
  }

  async rejectConnectionRequest(connectionId: number, userId: number) {
    console.log(
      `[ConnectionService] Aloqa so'rovini rad etish: ID: ${connectionId}, Qabul qiluvchi ID: ${userId}`,
    );
    const connectionRequest = await this.connectionsRepository.findOne({
      where: { id: connectionId, receiverId: userId, status: 'pending' },
      relations: ['requester', 'receiver'],
    });

    if (!connectionRequest) {
      console.warn(
        `[ConnectionService] Aloqa so'rovi topilmadi yoki allaqachon rad etilgan: ID: ${connectionId}, Qabul qiluvchi ID: ${userId}`,
      );
      throw new NotFoundException(
        'Aloqa so‘rovi topilmadi yoki allaqachon rad etilgan.',
      );
    }

    connectionRequest.status = 'rejected';
    try {
      const updatedConnection =
        await this.connectionsRepository.save(connectionRequest);
      console.log(
        `[ConnectionService] Aloqa so'rovi rad etildi. ID: ${updatedConnection.id}, Yuboruvchi: ${connectionRequest.requesterId}, Qabul qiluvchi: ${connectionRequest.receiverId}`,
      );
      await this.notificationGateway.pushAndSave(
        connectionRequest.requesterId,
        'REJECTED',
        `${connectionRequest.receiver.profile?.firstName || connectionRequest.receiver.email} sizning aloqa so‘rovingizni rad etdi.`,
      );
      return updatedConnection;
    } catch (error) {
      console.error(
        `[ConnectionService] Aloqa so'rovini rad etishni saqlashda xatolik:`,
        error,
      );
      throw error;
    }
  }

  async removeConnection(connectedUserId: number, userId: number) {
    console.log(
      `[ConnectionService] Aloqani o'chirish: Foydalanuvchi ID: ${userId}, Bog'langan foydalanuvchi ID: ${connectedUserId}`,
    );
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
      console.warn(
        `[ConnectionService] Aloqa topilmadi: Foydalanuvchi ID: ${userId}, Bog'langan foydalanuvchi ID: ${connectedUserId}`,
      );
      throw new NotFoundException(
        'Ushbu foydalanuvchi bilan aloqangiz topilmadi.',
      );
    }

    try {
      const connectedUser = await this.usersService.findById(connectedUserId);
      const currentUser = await this.usersService.findById(userId);

      if (connectedUser && currentUser) {
        await this.notificationGateway.pushAndSave(
          userId,
          'CONNECTION_REMOVED',
          `${connectedUser.profile?.firstName || connectedUser.email} bilan aloqangiz o‘chirildi.`,
        );
        await this.notificationGateway.pushAndSave(
          connectedUserId,
          'CONNECTION_REMOVED',
          `${currentUser.profile?.firstName || currentUser.email} bilan aloqangiz o‘chirildi.`,
        );
        console.log(
          `[ConnectionService] Aloqa o'chirildi va bildirishnomalar yuborildi: Foydalanuvchi ID: ${userId}, Bog'langan foydalanuvchi ID: ${connectedUserId}`,
        );
      } else {
        console.warn(
          `[ConnectionService] Aloqa o'chirildi, lekin foydalanuvchilar topilmadi (bildirishnoma yuborilmadi): Foydalanuvchi ID: ${userId}, Bog'langan foydalanuvchi ID: ${connectedUserId}`,
        );
      }
      return { message: 'Aloqa o‘chirildi' };
    } catch (error) {
      console.error(
        `[ConnectionService] Aloqani o'chirishda bildirishnoma yuborishda xatolik:`,
        error,
      );
      throw error;
    }
  }

  async getUserConnections(userId: number): Promise<Connection[]> {
    try {
      const connections = await this.connectionsRepository.find({
        where: [
          { requesterId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
        relations: [
          'requester',
          'receiver',
          'receiver.profile',
          'requester.profile',
        ],
      });
      console.log(
        `[ConnectionService] Foydalanuvchi aloqalari olindi. Foydalanuvchi ID: ${userId}, Aloqalar soni: ${connections.length}`,
      );
      return connections;
    } catch (error) {
      console.error(
        `[ConnectionService] Foydalanuvchi aloqalarini olishda xatolik (Foydalanuvchi ID: ${userId}):`,
        error,
      );
      throw error;
    }
  }

  async getIncomingConnectionRequests(userId: number): Promise<Connection[]> {
    try {
      const requests = await this.connectionsRepository.find({
        where: { receiverId: userId, status: 'pending' },
        relations: ['requester', 'requester.profile'],
      });
      console.log(
        `[ConnectionService] Kiruvchi aloqa so'rovlari olindi. Foydalanuvchi ID: ${userId}, So'rovlar soni: ${requests.length}`,
      );
      return requests;
    } catch (error) {
      console.error(
        `[ConnectionService] Kiruvchi aloqa so'rovlarini olishda xatolik (Foydalanuvchi ID: ${userId}):`,
        error,
      );
      throw error;
    }
  }

  async getOutgoingConnectionRequests(userId: number): Promise<Connection[]> {
    try {
      const requests = await this.connectionsRepository.find({
        where: { requesterId: userId, status: 'pending' },
        relations: [
          'receiver',
          'requester',
          'receiver.profile',
          'receiver.profile.skills',
        ],
      });
      console.log(
        `[ConnectionService] Chiquvchi aloqa so'rovlari olindi. Foydalanuvchi ID: ${userId}, So'rovlar soni: ${requests.length}`,
      );
      return requests;
    } catch (error) {
      console.error(
        `[ConnectionService] Chiquvchi aloqa so'rovlarini olishda xatolik (Foydalanuvchi ID: ${userId}):`,
        error,
      );
      throw error;
    }
  }
}
