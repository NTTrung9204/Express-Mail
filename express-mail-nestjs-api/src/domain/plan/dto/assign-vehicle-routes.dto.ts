import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsInt,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleRouteAssignmentDto {
  @ApiProperty({
    description: 'Vehicle route ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  vehicle_route_id: number;

  @ApiProperty({
    description: 'Shipper ID',
    example: 'SHIPPER_001',
  })
  @IsString()
  @IsNotEmpty()
  shipper_id: string;
}

export class AssignVehicleRoutesDto {
  @ApiProperty({
    description: 'List of vehicle route assignments',
    type: [VehicleRouteAssignmentDto],
    example: [
      { vehicle_route_id: 1, shipper_id: 'SHIPPER_001' },
      { vehicle_route_id: 2, shipper_id: 'SHIPPER_002' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VehicleRouteAssignmentDto)
  assignments: VehicleRouteAssignmentDto[];
}
