import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { UploadService } from './uploadService';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Multer buffer orqali olish
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is missing');
    }

    // Faylni Vercel Blob-ga yuklash
    const vercelFileUrl = await this.uploadService.uploadFile(file);

    return { url: vercelFileUrl };
  }
}
