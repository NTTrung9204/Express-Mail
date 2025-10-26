import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query,
  // UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthJwtRequest } from 'src/common/@type/jwt-payload.type';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ShippingResponseDto } from '../shipping/dto';

@ApiTags('Orders')
@Controller('orders')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private transformToOrderResponseDto(order: any): OrderResponseDto {
    return {
      ...order,
      shipping: order.shipping?.map((ship: any) => ({
        id: ship.id,
        shipperId: ship.shipperId,
        orderId: order.id,
        status: ship.status,
        createdAt: ship.createdAt,
        updatedAt: ship.updatedAt,
      })),
      deleted_at: order.deleted_at ?? undefined,
    } as OrderResponseDto;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order with products' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthJwtRequest,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.create(createOrderDto, req.user);
    return new ApiResponseDto<OrderResponseDto>(
      true,
      'Order created successfully',
      this.transformToOrderResponseDto(order),
      undefined,
      201,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with optional filters' })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Filter by order code',
  })
  @ApiQuery({
    name: 'shopId',
    required: false,
    description: 'Filter by shop ID',
  })
  @ApiQuery({
    name: 'order_status',
    required: false,
    description: 'Filter by order status',
  })
  @ApiQuery({
    name: 'shipping_status',
    required: false,
    description: 'Filter by shipping status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [OrderResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async findAll(
    @Query() query: OrderQueryDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<OrderResponseDto>>> {
    const paginated = await this.orderService.findAll(query);

    // Transform each order using helper function
    const transformedItems = paginated.data.map((order) =>
      this.transformToOrderResponseDto(order),
    );

    const transformedPaginated = {
      ...paginated,
      data: transformedItems,
    } as PaginatedResponseDto<OrderResponseDto>;

    return new ApiResponseDto(
      true,
      'Orders retrieved successfully',
      transformedPaginated,
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get order by code' })
  @ApiParam({ name: 'code', description: 'Order code', example: 'ORD12345' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByCode(
    @Param('code') code: string,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.findByCode(code);
    return new ApiResponseDto(
      true,
      'Order retrieved successfully',
      this.transformToOrderResponseDto(order),
    );
  }

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get orders by shop ID' })
  @ApiParam({ name: 'shopId', description: 'Shop ID', example: 'SHOP001' })
  @ApiResponse({
    status: 200,
    description: 'Orders found for the shop',
    type: [OrderResponseDto],
  })
  async findByShopId(
    @Param('shopId') shopId: string,
  ): Promise<ApiResponseDto<OrderResponseDto[]>> {
    const orders = await this.orderService.findByShopId(shopId);
    return new ApiResponseDto(
      true,
      'Orders retrieved successfully',
      orders.map((order) => this.transformToOrderResponseDto(order)),
    );
  }

  @Get('status/order/:orderStatus')
  @ApiOperation({ summary: 'Get orders by order status' })
  @ApiParam({
    name: 'orderStatus',
    description: 'Order status',
    example: 'PENDING',
    enum: ['PENDING', 'CANCELED', 'COMPLETED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Orders found with the specified order status',
    type: [OrderResponseDto],
  })
  async findByOrderStatus(
    @Param('orderStatus') orderStatus: string,
  ): Promise<ApiResponseDto<OrderResponseDto[]>> {
    const orders = await this.orderService.findByOrderStatus(orderStatus);
    return new ApiResponseDto(
      true,
      'Orders retrieved successfully',
      orders.map((order) => this.transformToOrderResponseDto(order)),
    );
  }

  @Get('status/shipping/:shippingStatus')
  @ApiOperation({ summary: 'Get orders by shipping status' })
  @ApiParam({
    name: 'shippingStatus',
    description: 'Shipping status',
    example: 'PICKUP_REQUESTED',
    enum: [
      'PICKUP_REQUESTED',
      'IN_TRANSIT',
      'CLASSIFIED',
      'IN_WAREHOUSE',
      'SHIPPING',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Orders found with the specified shipping status',
    type: [OrderResponseDto],
  })
  async findByShippingStatus(
    @Param('shippingStatus') shippingStatus: string,
  ): Promise<ApiResponseDto<OrderResponseDto[]>> {
    const orders = await this.orderService.findByShippingStatus(shippingStatus);
    return new ApiResponseDto(
      true,
      'Orders retrieved successfully',
      orders.map((order) => this.transformToOrderResponseDto(order)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.findOne(id);
    return new ApiResponseDto(
      true,
      'Order retrieved successfully',
      this.transformToOrderResponseDto(order),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.update(id, updateOrderDto);
    return new ApiResponseDto(
      true,
      'Order updated successfully',
      this.transformToOrderResponseDto(order),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'Order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.orderService.remove(id);
  }
}
