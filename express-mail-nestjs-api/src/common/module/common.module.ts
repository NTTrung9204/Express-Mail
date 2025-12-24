import { Module } from '@nestjs/common';
import { DjangoService } from '../services/django.service';
import { RedisService } from '../services/redis.service';
import { FileUploadService } from '../services/file-upload.service';
import { PermissionService } from '../services/permission.service';
import { WebhookService } from '../services/webhook.service';

@Module({
  providers: [
    DjangoService,
    RedisService,
    FileUploadService,
    PermissionService,
    WebhookService,
  ],
  exports: [
    DjangoService,
    RedisService,
    FileUploadService,
    PermissionService,
    WebhookService,
  ],
})
export class CommonModule {}
