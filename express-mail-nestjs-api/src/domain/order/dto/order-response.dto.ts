import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { ShippingStatus } from '../enums/shipping-status.enum';
import { ProductResponseDto } from 'src/domain/product/dto/product-response.dto';
import { ShippingResponseDto } from 'src/domain/shipping/dto/shipping-response.dto';

export class OrderTransitionResponseDto {
  @ApiProperty({ description: 'Transition ID', example: 1 })
  id: number;

  @ApiPropertyOptional({
    description: 'Current post office ID',
    example: 'PO001',
  })
  currentPostOfficeId?: string;

  @ApiPropertyOptional({ description: 'Next post office ID', example: 'PO002' })
  nextPostOfficeId?: string;

  @ApiProperty({ description: 'Transition status', example: 'PENDING' })
  status: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class OrderPostOfficeResponseDto {
  @ApiProperty({ description: 'Order post office ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Post office ID', example: 'PO001' })
  postOfficeId: string;

  @ApiProperty({ description: 'Status', example: 'PICKUP_REQUESTED' })
  status: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Order code', example: 'ORD12345' })
  code: string;

  @ApiProperty({ description: 'Shop ID', example: 'SHOP001' })
  shopId: string;

  @ApiProperty({ description: 'Shipping fee ID', example: 'SHIP001' })
  shippingFeeId: string;

  @ApiProperty({ description: 'Receiver phone number', example: '0123456789' })
  receiver_phone: string;

  @ApiProperty({
    description: 'Receiver province/city',
    example: 'Ho Chi Minh City',
  })
  receiver_province_city: string;

  @ApiProperty({ description: 'Receiver ward/commune', example: 'District 1' })
  receiver_ward_commune: string;

  @ApiProperty({ description: 'Receiver address', example: '123 Main Street' })
  receiver_address: string;

  @ApiProperty({
    description: 'Receiver coordinates',
    example: '10.762622,106.660172',
  })
  receiver_coordinate: string;

  @ApiProperty({ description: 'Package length in cm', example: 30 })
  length: number;

  @ApiProperty({ description: 'Package width in cm', example: 20 })
  width: number;

  @ApiProperty({ description: 'Package height in cm', example: 10 })
  height: number;

  @ApiProperty({ description: 'Package weight in kg', example: 1.5 })
  weight: number;

  @ApiProperty({ description: 'Cash on delivery amount', example: 500000 })
  cod: number;

  @ApiProperty({ description: 'Shipping cost', example: 25000 })
  shipping_cost: number;

  @ApiProperty({ description: 'Shipping cost payer', example: 25000 })
  shipping_cost_payper: number;

  @ApiProperty({
    description: 'Indicates whether the receiver pays for shipping',
    example: true,
  })
  is_receiver_pay_shipping: boolean;

  @ApiProperty({
    description: 'Shipping status',
    enum: ShippingStatus,
    example: 'PICKUP_REQUESTED',
  })
  shipping_status: ShippingStatus;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: 'PENDING',
  })
  order_status: OrderStatus;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Soft delete date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deleted_at?: Date;

  @ApiProperty({ description: 'Order products', type: [ProductResponseDto] })
  products: ProductResponseDto[];

  @ApiProperty({
    description: 'Order transitions',
    type: [OrderTransitionResponseDto],
  })
  transitions: OrderTransitionResponseDto[];

  @ApiProperty({
    description: 'Order post offices',
    type: [OrderPostOfficeResponseDto],
  })
  orderPostOffices: OrderPostOfficeResponseDto[];

  @ApiProperty({
    description: 'Shipping information',
    type: [ShippingResponseDto],
  })
  @ApiProperty({ type: () => [ShippingResponseDto] })
  shipping: ShippingResponseDto[];
}
