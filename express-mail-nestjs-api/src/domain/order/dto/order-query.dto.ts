import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class OrderQueryDto {
  @ApiPropertyOptional({ description: 'Order code', example: 'ORD12345' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Shop ID', example: 'SHOP001' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  order_status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Shipping status',
    enum: ShippingStatus,
    example: 'PICKUP_REQUESTED',
  })
  @IsOptional()
  @IsEnum(ShippingStatus)
  shipping_status?: ShippingStatus;
}
