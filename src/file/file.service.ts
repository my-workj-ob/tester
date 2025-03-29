import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async saveFile(fileUrl: string): Promise<FileEntity> {
    const file = this.fileRepository.create({ url: fileUrl });
    return this.fileRepository.save(file);
  }
}
