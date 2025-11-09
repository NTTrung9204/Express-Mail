import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';
import { PostOfficeOrderStatus } from './post-office-orders-query.dto';

export class PostOfficeOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto], required: false })
  [PostOfficeOrderStatus.IN_WAREHOUSE]?: OrderResponseDto[];

  @ApiProperty({ type: [OrderResponseDto], required: false })
  [PostOfficeOrderStatus.PICKUP_REQUESTED]?: OrderResponseDto[];

  @ApiProperty({ type: [OrderResponseDto], required: false })
  [PostOfficeOrderStatus.CLASSIFIED]?: OrderResponseDto[];

  @ApiProperty({ type: [OrderResponseDto], required: false })
  [PostOfficeOrderStatus.TRANSITING]?: OrderResponseDto[];
}
