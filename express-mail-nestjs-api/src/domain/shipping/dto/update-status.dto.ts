import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class UpdateShippingStatusDto {
  @ApiProperty({ description: 'New shipping status', enum: ShippingStatus })
  @IsEnum(ShippingStatus)
  status: ShippingStatus;
}


