import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/commnents.dto';
export interface RequestWithUser extends Request {
  user: User;
}

@Controller('comments')
@ApiBearerAuth() // Swaggerda token qo'shish uchun
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  getComments(
    @Query('entityId') entityId: number,
    @Query('entityType') entityType: string,
  ) {
    return this.commentService.getComments(entityId, entityType);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Yangi izoh yaratish' })
  @ApiResponse({
    status: 201,
    description: 'Izoh muvaffaqiyatli yaratildi.',
  })
  @ApiResponse({
    status: 400,
    description: 'Xato: Ma’lumotlar noto‘g‘ri yuborilgan.',
  })
  createComment(@Req() req: RequestWithUser, @Body() body: CreateCommentDto) {
    console.log('user create :', req.user);

    return this.commentService.createComment(
      req.user,
      body.entityId,
      body.entityType,
      body.content,
      body.parentCommentId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteComment(@Param('id') commentId: number) {
    return this.commentService.deleteComment(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  //
  likeComment(@Param('id') id: number) {
    return this.commentService.likeComment(id);
  }
}
