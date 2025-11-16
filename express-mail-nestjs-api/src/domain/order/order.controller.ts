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
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderWithFilesDto } from './dto/create-order-with-files.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { ShipperOrderQueryDto } from './dto/shipper-order-query.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthJwtRequest } from 'src/common/@type/jwt-payload.type';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { TransitionOrderDto } from './dto/transition-order.dto';
import { OrderPostOfficeDto } from './dto/order-post-office.dto';
import { PostOfficeOrderStatus } from './dto/post-office-orders-query.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('product_images', 100))
  @ApiOperation({ summary: 'Create a new order with products and images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOrderWithFilesDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthJwtRequest,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.create(
      createOrderDto,
      req.user,
      files,
    );
    return new ApiResponseDto<OrderResponseDto>(
      true,
      'Order created successfully',
      this.orderService.transformToOrderResponseDto(order),
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
      this.orderService.transformToOrderResponseDto(order),
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
      this.orderService.transformToOrderResponseDto(order),
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
      orders.map((order) =>
        this.orderService.transformToOrderResponseDto(order),
      ),
    );
  }

  @Get('shipper/:shipperId')
  @ApiOperation({ summary: 'Get orders assigned to a shipper (paginated)' })
  @ApiParam({
    name: 'shipperId',
    description: 'Shipper ID',
    example: 'SHPR001',
  })
  @ApiQuery({
    name: 'shipping_status',
    required: false,
    description: 'Filter by shipping status',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'From date (ISO8601)',
  })
  @ApiQuery({ name: 'to', required: false, description: 'To date (ISO8601)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Paginated orders for shipper',
    type: [OrderResponseDto],
  })
  async findByShipperId(
    @Param('shipperId') shipperId: string,
    @Query() query: ShipperOrderQueryDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<OrderResponseDto>>> {
    const paginated = await this.orderService.findByShipperId(shipperId, query);

    const transformed = {
      ...paginated,
      data: paginated.data.map((o) =>
        this.orderService.transformToOrderResponseDto(o),
      ),
    } as PaginatedResponseDto<OrderResponseDto>;

    return new ApiResponseDto(
      true,
      'Orders retrieved successfully',
      transformed,
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
      orders.map((order) =>
        this.orderService.transformToOrderResponseDto(order),
      ),
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
      orders.map((order) =>
        this.orderService.transformToOrderResponseDto(order),
      ),
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
      this.orderService.transformToOrderResponseDto(order),
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
      this.orderService.transformToOrderResponseDto(order),
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

  @Post('transition-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Transition order to next post office or confirm order moved to next post office',
  })
  @ApiParam({ name: 'transitionOrderDto', type: TransitionOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Order transitioned successfully',
    type: OrderResponseDto,
  })
  async transitionOrder(
    @Body() transitionOrderDto: TransitionOrderDto,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.orderService.transitionOrder(transitionOrderDto);
    return new ApiResponseDto(
      true,
      'Order transitioned successfully',
      this.orderService.transformToOrderResponseDto(order),
    );
  }

  @Post('order-post-office')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order-post-office association' })
  @ApiBody({ type: OrderPostOfficeDto })
  @ApiResponse({
    status: 201,
    description: 'Order-PostOffice association created successfully',
    type: OrderResponseDto,
  })
  async createOrderPostOffice(
    @Body() orderPostOfficeDto: OrderPostOfficeDto,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order =
      await this.orderService.createOrderPostOffice(orderPostOfficeDto);
    return new ApiResponseDto(
      true,
      'Order-PostOffice association created successfully',
      this.orderService.transformToOrderResponseDto(order),
    );
  }

  @Get('post-office/:postOfficeId')
  @ApiOperation({
    summary:
      'Get orders by post office ID with optional status filter and pagination',
  })
  @ApiParam({
    name: 'postOfficeId',
    description: 'Post Office ID',
    type: 'number',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter orders by status',
    required: false,
    enum: PostOfficeOrderStatus,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: 'number',
  })
  async findByPostOffice(
    @Param('postOfficeId', ParseIntPipe) postOfficeId: number,
    @Query('status') status?: PostOfficeOrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ApiResponseDto<PaginatedResponseDto<OrderResponseDto>>> {
    const paginated = await this.orderService.findOrdersByPostOffice(
      postOfficeId,
      status,
      { page, limit },
    );

    return new ApiResponseDto(true, 'Orders retrieved successfully', paginated);
  }
}
