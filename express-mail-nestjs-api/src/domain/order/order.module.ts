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
import { Shipping } from '../shipping/entities/shipping.entity';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { DjangoService } from 'src/common/services/django.service';
import { CommonModule } from 'src/common/module/common.module';
import { FileUploadService } from 'src/common/services/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderTransition,
      OrderPostOffice,
      Shipping,
      Product,
    ]),
    forwardRef(() => ProductModule),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    CommonModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    JwtAuthGuard,
    ProductService,
    DjangoService,
    FileUploadService,
  ],
  exports: [
    OrderService,
    TypeOrmModule,
    ProductService,
    DjangoService,
    FileUploadService,
  ],
})
export class OrderModule {}
