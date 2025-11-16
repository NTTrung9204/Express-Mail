import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { OrderService } from '../order/order.service';
import { Order } from '../order/entities/order.entity';
import { OrderTransition } from '../order/entities/order-transition.entity';
import { OrderPostOffice } from '../order/entities/post-office-order.entity';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { CommonModule } from 'src/common/module/common.module';

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
    CommonModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService, JwtAuthGuard, OrderService, ProductService],
  exports: [ShippingService],
})
export class ShippingModule {}
