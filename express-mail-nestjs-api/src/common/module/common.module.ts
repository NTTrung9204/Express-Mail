import { Module } from '@nestjs/common';
import { DjangoService } from '../services/django.service';
import { RedisService } from '../services/redis.service';
import { FileUploadService } from '../services/file-upload.service';

@Module({
  providers: [DjangoService, RedisService, FileUploadService],
  exports: [DjangoService, RedisService, FileUploadService],
})
export class CommonModule {}
