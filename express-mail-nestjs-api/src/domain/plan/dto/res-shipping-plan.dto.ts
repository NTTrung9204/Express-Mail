import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from 'src/domain/order/dto/order-response.dto';
import { RouteStep } from '../entities/route-step.entity';

export class OrderWithRouteStepDto extends OrderResponseDto {
  @ApiProperty({
    description: 'Route step information',
    type: Object,
    required: false,
  })
  routeStep?: RouteStep;
}

export class ResShippingPlanDto {
  @ApiProperty({
    description: 'Orders with shop profile and route step',
    type: [OrderWithRouteStepDto],
  })
  orders: OrderWithRouteStepDto[];

  @ApiProperty({
    description: 'Geometry',
    type: String,
  })
  geometry: string;

  @ApiProperty({
    description: 'Mode of the route',
    type: String,
  })
  mode: string;

  @ApiProperty({
    description: 'Time of the route',
    type: Date,
  })
  time: Date;

  @ApiProperty({
    description: 'Distance of the route',
    type: Number,
  })
  distance: number;

  @ApiProperty({
    description: 'Duration of the route',
    type: Number,
  })
  duration: number;
}
