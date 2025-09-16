import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderController } from './domain/order/order.controller';
import { OrderService } from './domain/order/order.service';
import { OrderModule } from './domain/order/order.module';
import { ProductController } from './domain/product/product.controller';
import { ProductService } from './domain/product/product.service';
import { ProductModule } from './domain/product/product.module';
import { ShippingController } from './domain/shipping/shipping.controller';
import { ShippingService } from './domain/shipping/shipping.service';
import { ShippingModule } from './domain/shipping/shipping.module';

@Module({
  imports: [OrderModule, ProductModule, ShippingModule],
  controllers: [
    AppController,
    OrderController,
    ProductController,
    ShippingController,
  ],
  providers: [AppService, OrderService, ProductService, ShippingService],
})
export class AppModule {}
