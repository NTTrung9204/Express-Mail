import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class CreateShippingDto {
  @ApiProperty({ description: 'Order ID to ship', example: 1 })
  @IsInt()
  @Min(1)
  orderId: number;

  @ApiProperty({
    description: 'Initial shipping status',
    enum: ShippingStatus,
    example: ShippingStatus.PICKUP_REQUESTED,
  })
  @IsEnum(ShippingStatus)
  status: ShippingStatus;

  @ApiProperty({
    description: 'Assigned shipper id',
    example: 'SHIPPER_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shipperId?: string;

  @ApiProperty({
    description: 'Route step ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  routeStepId?: number;
}
