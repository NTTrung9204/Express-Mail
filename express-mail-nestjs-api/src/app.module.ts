import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './domain/order/order.module';
import { ProductModule } from './domain/product/product.module';
import { ShippingModule } from './domain/shipping/shipping.module';
import { DjangoService } from './common/services/django.service';
import { RedisService } from './common/services/redis.service';
import { dataSourceOptions } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    OrderModule,
    ProductModule,
    ShippingModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService, DjangoService],
})
export class AppModule {}
