import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileService } from './file.service';

const uploadPath = '/tmp/uploads'; // Yangi yo'l

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  // upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new Error('File is missing');
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${host}/uploads/${file.filename}`;

    const savedFile = await this.fileService.saveFile(fileUrl);

    return { fileId: savedFile.id, fileUrl: savedFile.url };
  }
}
