import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class GetShippingPlanDto {
  @ApiProperty({
    description: 'Shipper ID',
    example: 'SHIPPER_001',
  })
  @IsString()
  @IsNotEmpty()
  shipper_id: string;

  @ApiProperty({
    description: 'Start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'End date (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}
