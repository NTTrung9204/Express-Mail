import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderTransition } from './entities/order-transition.entity';
import { OrderPostOffice } from './entities/post-office-order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductModule } from '../product/product.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DjangoService } from 'src/common/services/django.service';
import { RedisService } from 'src/common/services/redis.service';
import { Shipping } from '../shipping/entities/shipping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderTransition,
      OrderPostOffice,
      Shipping,
    ]),
    forwardRef(() => ProductModule),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtAuthGuard, RedisService, DjangoService],
  exports: [OrderService],
})
export class OrderModule {}
