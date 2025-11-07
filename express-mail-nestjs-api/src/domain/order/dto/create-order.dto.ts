import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  Min,
  MaxLength,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateProductForOrderDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop Dell XPS 13' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Product quantity', example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product weight in kg', example: 1.2 })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  img_url?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Receiver phone number', example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  receiver_phone: string;

  @ApiProperty({
    description: 'Receiver province/city',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_province_city: string;

  @ApiProperty({ description: 'Receiver ward/commune', example: 'District 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_ward_commune: string;

  @ApiProperty({ description: 'Receiver address', example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_address: string;

  @ApiProperty({
    description: 'Receiver coordinates',
    example: '10.762622,106.660172',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_coordinate: string;

  @ApiProperty({ description: 'Package length in cm', example: 30 })
  @IsNumber()
  @Min(0.1)
  length: number;

  @ApiProperty({ description: 'Package width in cm', example: 20 })
  @IsNumber()
  @Min(0.1)
  width: number;

  @ApiProperty({ description: 'Package height in cm', example: 10 })
  @IsNumber()
  @Min(0.1)
  height: number;

  @ApiProperty({ description: 'Package weight in kg', example: 1.5 })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiProperty({ description: 'Cash on delivery amount', example: 500000 })
  @IsNumber()
  @Min(0)
  cod: number;

  @ApiProperty({
    description: 'Indicates whether the receiver pays for shipping',
    example: true,
  })
  @IsBoolean()
  is_receiver_pay_shipping: boolean;

  @ApiProperty({
    description: 'List of products',
    type: [CreateProductForOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductForOrderDto)
  products: CreateProductForOrderDto[];

  @ApiProperty({
    description: 'Status of the order',
    example: 'PENDING',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  @MaxLength(50)
  order_status?: OrderStatus;
}
