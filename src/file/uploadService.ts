import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // Faylni Vercel Blob-ga yuklash
      const blob = await put(file.originalname, file.buffer, {
        access: 'public', // Faylni hammaga ochiq qilish
      });

      return blob.url; // Yuklangan fayl URL-si
    } catch (error) {
      console.error('Vercel Blob yuklashda xatolik:', error);
      throw new Error('Vercel Blob-ga fayl yuklashda muammo yuz berdi!');
    }
  }
}
