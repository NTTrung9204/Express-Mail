import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ShippingService } from './shipping.service';
import {
  AssignShipperDto,
  CreateShippingDto,
  ShippingResponseDto,
  UpdateShippingDto,
} from './dto';
import { UpdateShippingStatusDto } from './dto/update-status.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { Shipping } from './entities/shipping.entity';
import { GetShipperOrdersDto } from './dto/get-shipper-orders.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthJwtRequest } from 'src/common/@type/jwt-payload.type';

@ApiTags('Shipping')
@Controller('shipping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiBearerAuth()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @ApiOperation({ summary: 'Create shipping' })
  @ApiBody({ type: CreateShippingDto })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: ShippingResponseDto,
  })
  async create(
    @Body() dto: CreateShippingDto,
  ): Promise<ApiResponseDto<ShippingResponseDto>> {
    const shipping = await this.shippingService.create(dto);
    return new ApiResponseDto(
      true,
      'Shipping created',
      shipping as any,
      undefined,
      201,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List shipping (paginated)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, type: [ShippingResponseDto] })
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<Shipping>>> {
    const list = await this.shippingService.findAll(pagination);
    return new ApiResponseDto(true, 'Shipping list', list);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipping by id' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: ShippingResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<ShippingResponseDto>> {
    const shipping = await this.shippingService.findOne(id);
    return new ApiResponseDto(true, 'Shipping retrieved', shipping as any);
  }

  @Get('shipper/:shipperId')
  @ApiOperation({ summary: 'Get orders by shipper ID with filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async getShipperOrders(
    @Query() query: GetShipperOrdersDto,
    @Req() req: AuthJwtRequest,
  ): Promise<ApiResponseDto<PaginatedResponseDto<Shipping>>> {
    const orders = await this.shippingService.getShipperOrders(
      String(req.user.userId),
      query,
    );
    return new ApiResponseDto(
      true,
      'Shipper orders retrieved successfully',
      orders,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateShippingDto })
  @ApiResponse({ status: 200, type: ShippingResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingDto,
  ): Promise<ApiResponseDto<ShippingResponseDto>> {
    const shipping = await this.shippingService.update(id, dto);
    return new ApiResponseDto(true, 'Shipping updated', shipping as any);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign shipper to shipping' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: AssignShipperDto })
  @ApiResponse({ status: 200, type: ShippingResponseDto })
  async assignShipper(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignShipperDto,
  ): Promise<ApiResponseDto<ShippingResponseDto>> {
    const shipping = await this.shippingService.assignShipper(id, dto);
    return new ApiResponseDto(true, 'Shipper assigned', shipping as any);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipping status' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateShippingStatusDto })
  @ApiResponse({ status: 200, type: ShippingResponseDto })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingStatusDto,
  ): Promise<ApiResponseDto<ShippingResponseDto>> {
    const shipping = await this.shippingService.updateStatus(id, dto);
    return new ApiResponseDto(true, 'Status updated', shipping as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete shipping' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.shippingService.remove(id);
  }
}
