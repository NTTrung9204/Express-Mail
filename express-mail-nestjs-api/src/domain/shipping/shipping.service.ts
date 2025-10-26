import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from './entities/shipping.entity';
import { AssignShipperDto, CreateShippingDto, UpdateShippingDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { UpdateShippingStatusDto } from './dto/update-status.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
  ) {}

  async create(createShippingDto: CreateShippingDto): Promise<Shipping> {
    try {
      const shipping = this.shippingRepository.create({
        shipperId: createShippingDto.shipperId,
        status: createShippingDto.status,
        order: { id: createShippingDto.orderId } as any,
      });
      return await this.shippingRepository.save(shipping);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to create shipping');
    }
  }

  async findAll(
    pagination?: PaginationDto,
  ): Promise<PaginatedResponseDto<Shipping>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const [items, total] = await this.shippingRepository.findAndCount({
      relations: ['order'],
      withDeleted: false,
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto<Shipping>(items, total, page, limit);
  }

  async findOne(id: number): Promise<Shipping> {
    const shipping = await this.shippingRepository.findOne({
      where: { id },
      relations: ['order'],
      withDeleted: false,
    });
    if (!shipping) {
      throw new NotFoundException(`Shipping with ID ${id} not found`);
    }
    return shipping;
  }

  async update(
    id: number,
    updateShippingDto: UpdateShippingDto,
  ): Promise<Shipping> {
    const shipping = await this.findOne(id);

    if (updateShippingDto.shipperId !== undefined) {
      shipping.shipperId = updateShippingDto.shipperId;
    }
    if (updateShippingDto.status !== undefined) {
      shipping.status = updateShippingDto.status;
    }
    if (updateShippingDto.orderId !== undefined) {
      shipping.order = { id: updateShippingDto.orderId } as any;
    }

    try {
      return await this.shippingRepository.save(shipping);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update shipping');
    }
  }

  async remove(id: number): Promise<void> {
    const shipping = await this.findOne(id);
    if (!shipping) {
      throw new NotFoundException(`Shipping with ID ${id} not found`);
    }
    try {
      await this.shippingRepository.softDelete(id);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to delete shipping');
    }
  }

  async assignShipper(id: number, dto: AssignShipperDto): Promise<Shipping> {
    const shipping = await this.findOne(id);
    shipping.shipperId = dto.shipperId;
    try {
      return await this.shippingRepository.save(shipping);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to assign shipper');
    }
  }

  async updateStatus(
    id: number,
    dto: UpdateShippingStatusDto,
  ): Promise<Shipping> {
    const shipping = await this.findOne(id);
    shipping.status = dto.status;
    try {
      return await this.shippingRepository.save(shipping);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update status');
    }
  }
}
