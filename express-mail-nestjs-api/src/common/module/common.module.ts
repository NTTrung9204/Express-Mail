import { Module } from '@nestjs/common';
import { DjangoService } from '../services/django.service';
import { RedisService } from '../services/redis.service';

@Module({
  providers: [DjangoService, RedisService],
  exports: [DjangoService, RedisService],
})
export class CommonModule {}
