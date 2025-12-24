import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { RoutePlan } from './entities/route-plan.entity';
import { VehicleRoute } from './entities/vehicle-route.entity';
import { RouteStep } from './entities/route-step.entity';
import { Order } from '../order/entities/order.entity';
import { ShippingModule } from '../shipping/shipping.module';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/module/common.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([RoutePlan, VehicleRoute, RouteStep, Order]),
    forwardRef(() => ShippingModule),
    forwardRef(() => OrderModule),
    CommonModule,
  ],
  providers: [PlanService, OrderService],
  controllers: [PlanController],
  exports: [PlanService],
})
export class PlanModule {}
