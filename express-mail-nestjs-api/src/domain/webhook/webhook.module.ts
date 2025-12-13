import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { CommonModule } from 'src/common/module/common.module';

@Module({
  imports: [CommonModule],
  controllers: [WebhookController],
  exports: [],
})
export class WebhookModule {}
