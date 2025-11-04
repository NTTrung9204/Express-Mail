import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignShipperDto {
  @ApiProperty({ description: 'Shipper ID to assign', example: 'SHIPPER_001' })
  @IsString()
  @IsNotEmpty()
  shipperId: string;
}
