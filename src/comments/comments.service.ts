/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getComments(
    entityId: number,
    entityType: string,
    page = 1,
    limit = 10,
  ) {
    const [comments, count] = await this.commentRepository.findAndCount({
      where: { entityId, entityType, parentComment: IsNull() }, // ✅ TO'G'RI
      relations: [
        'user',
        'user.profile',
        'replies',
        'replies.user',
        'replies.user.profile',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      comments,
      total: count,
      hasNextPage: count > page * limit,
    };
  }

  async createComment(
    userPayload: User,
    entityId: number,
    entityType: string,
    content: string,
    parentCommentId?: number | null,
  ) {
    const userId = (userPayload as any).userId;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    console.log('profiles: ', user);

    if (!user) throw new NotFoundException('User not found');

    let parentComment: Comment | null = null;
    if (parentCommentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentCommentId },
        relations: ['user', 'user.profile'],
      });

      console.log('created-replay: ', parentComment);

      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepository.create({
      user,
      entityId,
      entityType,
      content,
      likes: 0,
      parentComment: parentComment || undefined,
    });

    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return this.commentRepository.remove(comment);
  }

  async likeComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.likes += 1;
    return this.commentRepository.save(comment);
  }
}
