import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './domain/order/order.module';
import { ProductModule } from './domain/product/product.module';
import { ShippingModule } from './domain/shipping/shipping.module';
import { dataSourceOptions } from './config/database.config';
import { PlanModule } from './domain/plan/plan.module';
import { CommonModule } from './common/module/common.module';
import { FileModule } from './domain/file/file.module';
import { WebhookModule } from './domain/webhook/webhook.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    OrderModule,
    ProductModule,
    ShippingModule,
    PlanModule,
    CommonModule,
    FileModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
