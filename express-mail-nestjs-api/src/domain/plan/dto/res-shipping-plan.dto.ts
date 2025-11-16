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
}
