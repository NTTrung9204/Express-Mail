import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderTransitionStatus } from '../enums/order-transition-status.enum';

export class TransitionOrderDto {
  @ApiProperty({ description: 'Order ID', example: 402, type: Number })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Next Post Office ID',
    example: '17',
    type: String,
  })
  @IsOptional()
  @IsString()
  nextPostOfficeId?: string;

  @ApiProperty({
    description: 'Current Post Office ID',
    example: '17',
    type: String,
  })
  @IsOptional()
  @IsString()
  currentPostOfficeId?: string;

  @ApiProperty({
    description: 'Transition Status',
    example: 'PENDING',
    enum: OrderTransitionStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderTransitionStatus)
  status: OrderTransitionStatus;
}
