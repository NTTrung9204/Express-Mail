import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OrderPostOfficeStatus } from '../enums/order-post-office-status.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderPostOfficeDto {
  @ApiProperty({ description: 'Order ID', example: 402, type: Number })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Post Office ID',
    example: '17',
    type: String,
  })
  @IsString()
  postOfficeId: string;

  @ApiProperty({
    description: 'Order Post Office Status',
    example: 'IN_WAREHOUSE',
    enum: OrderPostOfficeStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderPostOfficeStatus)
  status: OrderPostOfficeStatus;
}
