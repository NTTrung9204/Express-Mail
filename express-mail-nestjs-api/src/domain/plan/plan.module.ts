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

@Module({
  imports: [
    TypeOrmModule.forFeature([RoutePlan, VehicleRoute, RouteStep, Order]),
    forwardRef(() => ShippingModule),
    forwardRef(() => OrderModule),
  ],
  providers: [PlanService, OrderService],
  controllers: [PlanController],
  exports: [PlanService],
})
export class PlanModule {}
