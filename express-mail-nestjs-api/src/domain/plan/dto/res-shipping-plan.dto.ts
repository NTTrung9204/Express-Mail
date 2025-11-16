import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from 'src/domain/order/dto/order-response.dto';

export class ResShippingPlanDto {
  @ApiProperty({
    description: 'Orders with shop profile',
    type: [OrderResponseDto],
  })
  orders: OrderResponseDto[];

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
