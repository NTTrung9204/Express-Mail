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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponseDto<ProductResponseDto>> {
    const product = await this.productService.create(createProductDto);
    return new ApiResponseDto<ProductResponseDto>(
      true,
      'Product created successfully',
      product as ProductResponseDto,
      undefined,
      201,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductResponseDto],
  })
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<ApiResponseDto<any>> {
    const products = await this.productService.findAll(pagination);
    return new ApiResponseDto(
      true,
      'Products retrieved successfully',
      products,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<ProductResponseDto>> {
    const product = await this.productService.findOne(id);
    return new ApiResponseDto(
      true,
      'Product retrieved successfully',
      product as ProductResponseDto,
    );
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get products by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Products found for the order',
    type: [ProductResponseDto],
  })
  async findByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<ApiResponseDto<ProductResponseDto[]>> {
    const products = await this.productService.findProductsByOrderId(orderId);
    return new ApiResponseDto(
      true,
      'Products retrieved successfully',
      products as ProductResponseDto[],
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ApiResponseDto<ProductResponseDto>> {
    const product = await this.productService.update(id, updateProductDto);
    return new ApiResponseDto(
      true,
      'Product updated successfully',
      product as ProductResponseDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productService.remove(id);
  }
}
