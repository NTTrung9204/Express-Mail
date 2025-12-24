import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetRoutePlansDto extends PaginationDto {
  @ApiProperty({ description: 'Post office ID', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  post_office_id: number;

  @ApiPropertyOptional({ description: 'Mode of the route', example: 'pickup' })
  @IsOptional()
  @IsString()
  mode?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
