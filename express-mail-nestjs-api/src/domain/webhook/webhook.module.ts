import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebhookController } from './webhook.controller';
import { CommonModule } from 'src/common/module/common.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    CommonModule,
  ],
  controllers: [WebhookController],
  exports: [],
})
export class WebhookModule {}
