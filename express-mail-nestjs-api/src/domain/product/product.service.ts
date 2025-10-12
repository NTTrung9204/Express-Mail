import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create({
        name: createProductDto.name,
        quantity: createProductDto.quantity,
        weight: createProductDto.weight,
        img_url: createProductDto.img_url,
        order: { id: createProductDto.orderId } as any,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['order'],
      withDeleted: false,
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['order'],
      withDeleted: false,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Update only provided fields
    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.quantity !== undefined) {
      product.quantity = updateProductDto.quantity;
    }
    if (updateProductDto.weight !== undefined) {
      product.weight = updateProductDto.weight;
    }
    if (updateProductDto.img_url !== undefined) {
      product.img_url = updateProductDto.img_url;
    }
    if (updateProductDto.orderId !== undefined) {
      product.order = { id: updateProductDto.orderId } as any;
    }

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      await this.productRepository.softDelete(id);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to delete product');
    }
  }

  async findProductsByOrderId(orderId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { order: { id: orderId } },
      relations: ['order'],
      withDeleted: false,
    });
  }
}
