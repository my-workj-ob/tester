import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comments.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async toggleLike(commentId: number, userId: number) {
    // Kommentni olish
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['likes', 'likes.user'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    // Like bosilganmi?
    const existingLike = await this.likeRepository.findOne({
      where: {
        comment: { id: commentId },
        user: { id: userId },
      },
    });

    let likedByCurrentUser = false;

    if (existingLike) {
      // ❌ Unlike qilish
      await this.likeRepository.remove(existingLike);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // ✅ Like qo‘shish
      const newLike = this.likeRepository.create({
        user: { id: userId },
        comment,
      });
      await this.likeRepository.save(newLike);
      comment.likesCount += 1;
      likedByCurrentUser = true; // Foydalanuvchi like bosgan
    }

    // Yangi like sonini yangilash
    await this.commentRepository.update(commentId, {
      likesCount: comment.likesCount,
    });

    return {
      message: existingLike ? 'Like removed' : 'Liked',
      likes: comment.likesCount,
      likedByCurrentUser, // ✅ Frontendga qaytaramiz
    };
  }
}
