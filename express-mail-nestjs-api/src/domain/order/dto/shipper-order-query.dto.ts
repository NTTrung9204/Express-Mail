import { IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingStatus } from '../../shipping/enums/shipping-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ShipperOrderQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Shipping status', enum: ShippingStatus })
  @IsOptional()
  @IsEnum(ShippingStatus)
  shipping_status?: ShippingStatus;

  @ApiPropertyOptional({
    description: 'From date (ISO8601)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'To date (ISO8601)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
