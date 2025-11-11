import { Order } from 'src/domain/order/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ResShippingPlanDto {
  @ApiProperty({
    description: 'Orders',
    type: [Order],
  })
  orders: Order[];

  @ApiProperty({
    description: 'Geometry',
    type: String,
  })
  geometry: string;
}
