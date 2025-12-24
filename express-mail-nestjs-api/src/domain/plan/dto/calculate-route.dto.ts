import { IsNumber, IsArray, IsEnum, Min, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RouteMode {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

export class CalculateRouteDto {
  @ApiProperty({
    description: 'Post office ID',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  post_office_id: number;

  @ApiProperty({
    description: 'Number of vehicles (shippers)',
    example: 3,
  })
  @IsNumber()
  @Min(1)
  vehicles: number;

  @ApiProperty({
    description: 'List of order IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  order_id_list: number[];

  @ApiProperty({
    description: 'Mode: pickup or delivery',
    example: 'pickup',
    enum: RouteMode,
  })
  @IsEnum(RouteMode)
  mode: RouteMode;
}
