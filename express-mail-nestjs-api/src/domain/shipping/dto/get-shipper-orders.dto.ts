import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class GetShipperOrdersDto {
  @ApiPropertyOptional({ enum: ShippingStatus })
  @IsEnum(ShippingStatus)
  @IsOptional()
  status?: ShippingStatus;

  @ApiPropertyOptional({
    type: Date,
    description: 'Start date (format: YYYY-MM-DD or ISO string)',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'End date (format: YYYY-MM-DD or ISO string)',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  to?: Date;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
