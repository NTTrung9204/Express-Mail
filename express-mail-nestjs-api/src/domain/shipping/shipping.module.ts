import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from 'src/common/services/redis.service';
import { DjangoService } from 'src/common/services/django.service';
import { OrderService } from '../order/order.service';
import { Order } from '../order/entities/order.entity';
import { OrderTransition } from '../order/entities/order-transition.entity';
import { OrderPostOffice } from '../order/entities/post-office-order.entity';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipping,
      Order,
      OrderTransition,
      OrderPostOffice,
      Product,
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ShippingController],
  providers: [
    ShippingService,
    JwtAuthGuard,
    RedisService,
    DjangoService,
    OrderService,
    ProductService,
  ],
  exports: [ShippingService],
})
export class ShippingModule {}
