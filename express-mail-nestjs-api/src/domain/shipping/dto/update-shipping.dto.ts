import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class UpdateShippingDto {
  @ApiPropertyOptional({ description: 'Order ID to ship', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  orderId?: number;

  @ApiPropertyOptional({ description: 'Shipping status', enum: ShippingStatus })
  @IsOptional()
  @IsEnum(ShippingStatus)
  status?: ShippingStatus;

  @ApiPropertyOptional({ description: 'Assigned shipper id', example: 'SHIPPER_001' })
  @IsOptional()
  @IsString()
  shipperId?: string;
}


