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
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class CreateProductForOrderDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop Dell XPS 13' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Product quantity', example: 5 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product weight in kg', example: 1.2 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiPropertyOptional({
    description:
      'Product image (will be uploaded and saved automatically, optional)',
  })
  @IsOptional()
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

  @ApiProperty({ description: 'Receiver district', example: 'District 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_district: string;

  @ApiProperty({ description: 'Receiver name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_name: string;

  @ApiProperty({ description: 'Package length in cm', example: 30 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
  })
  @IsNumber()
  @Min(0.1)
  length: number;

  @ApiProperty({ description: 'Package width in cm', example: 20 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
  })
  @IsNumber()
  @Min(0.1)
  width: number;

  @ApiProperty({ description: 'Package height in cm', example: 10 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
  })
  @IsNumber()
  @Min(0.1)
  height: number;

  @ApiProperty({ description: 'Package weight in kg', example: 1.5 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
  })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiProperty({ description: 'Cash on delivery amount', example: 500000 })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
  })
  @IsNumber()
  @Min(0)
  cod: number;

  @ApiProperty({
    description: 'Indicates whether the receiver pays for shipping',
    example: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_receiver_pay_shipping: boolean;

  @ApiProperty({
    description: 'List of products',
    type: [CreateProductForOrderDto],
  })
  @Transform(({ value }) => {
    let parsed = value;

    // Parse JSON string to array if needed
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return [];
      }
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Transform each item to CreateProductForOrderDto instance
    return parsed.map((item) =>
      plainToInstance(CreateProductForOrderDto, item, {
        enableImplicitConversion: true,
      }),
    );
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

  @IsEnum(ShippingStatus)
  @IsOptional()
  @MaxLength(50)
  shipping_status?: ShippingStatus;
}
