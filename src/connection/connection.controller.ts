/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ConnectionService } from './connection.service';
import { CreateConnectionRequestDto } from './dto/connection.dto';
import { Connection } from './entity/connection.entity';

@Controller('connections')
@ApiTags('Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Foydalanuvchi avtorizatsiyadan o‘tmagan',
})
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('request')
  @ApiCreatedResponse({
    description: 'Aloqa so‘rovi muvaffaqiyatli yuborildi',
    type: Connection,
  })
  async requestConnection(
    @Body() createConnectionRequestDto: CreateConnectionRequestDto,
    @Request() req,
  ) {
    const requester = req.user.userId as number;
    console.log(requester);

    return this.connectionService.requestConnection(
      requester,
      createConnectionRequestDto.receiverId,
    );
  }

  @Post('accept/:connectionId')
  @ApiParam({
    name: 'connectionId',
    type: Number,
    description: 'Qabul qilinadigan aloqa so‘rovi IDsi',
  })
  @ApiOkResponse({
    description: 'Aloqa so‘rovi qabul qilindi',
    type: Connection,
  })
  async acceptConnectionRequest(
    @Param('connectionId') connectionId: number,
    @Request() req,
  ) {
    const receiver = req.user.userId as number;
    return this.connectionService.acceptConnectionRequest(
      connectionId,
      receiver,
    );
  }

  @Post('reject/:connectionId')
  @ApiParam({
    name: 'connectionId',
    type: Number,
    description: 'Rad etiladigan aloqa so‘rovi IDsi',
  })
  @ApiOkResponse({ description: 'Aloqa so‘rovi rad etildi' })
  async rejectConnectionRequest(
    @Param('connectionId') connectionId: number,
    @Request() req,
  ) {
    const receiver = req.user.userId as number;
    return this.connectionService.rejectConnectionRequest(
      connectionId,
      receiver,
    );
  }

  @Delete('remove/:connectedUserId')
  @ApiParam({
    name: 'connectedUserId',
    type: Number,
    description: 'O‘chiriladigan aloqadagi foydalanuvchi IDsi',
  })
  @ApiOkResponse({ description: 'Aloqa o‘chirildi' })
  async removeConnection(
    @Param('connectedUserId') connectedUserId: number,
    @Request() req,
  ) {
    const userId = req.user.userId as number;
    return this.connectionService.removeConnection(connectedUserId, userId);
  }

  @Get('me')
  @ApiOkResponse({
    description: 'Foydalanuvchining aloqalari ro‘yxati',
    type: [Connection],
  })
  async getUserConnections(@Request() req) {
    const userId = req.user.userId as number;
    return this.connectionService.getUserConnections(userId);
  }

  @Get('requests/incoming')
  @ApiOkResponse({
    description: 'Foydalanuvchiga kelgan aloqa so‘rovlari',
    type: [Connection],
  })
  async getIncomingConnectionRequests(@Request() req) {
    const userId = req.user.userId as number;
    return this.connectionService.getIncomingConnectionRequests(userId);
  }

  @Get('requests/outgoing')
  @ApiOkResponse({
    description: 'Foydalanuvchi yuborgan aloqa so‘rovlari',
    type: [Connection],
  })
  async getOutgoingConnectionRequests(@Request() req) {
    const userId = req.user.userId as number;
    return this.connectionService.getOutgoingConnectionRequests(userId);
  }
}
