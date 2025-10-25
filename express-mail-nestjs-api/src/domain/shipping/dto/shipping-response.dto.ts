import { ApiProperty } from '@nestjs/swagger';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class ShippingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'SHIPPER_001', nullable: true })
  shipperId: string | null;

  @ApiProperty({ description: 'Order id' })
  orderId: number;

  @ApiProperty({ enum: ShippingStatus })
  status: ShippingStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
