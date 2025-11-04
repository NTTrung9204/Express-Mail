import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DjangoService } from 'src/common/services/django.service';
import { Shipping } from './entities/shipping.entity';
import { AssignShipperDto, CreateShippingDto, UpdateShippingDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { UpdateShippingStatusDto } from './dto/update-status.dto';
import { GetShipperOrdersDto } from './dto/get-shipper-orders.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
    private readonly djangoService: DjangoService,
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

  async getShipperOrders(
    shipperId: string,
    query: GetShipperOrdersDto,
  ): Promise<PaginatedResponseDto<Shipping>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const queryBuilder = this.shippingRepository
      .createQueryBuilder('shipping')
      .leftJoinAndSelect('shipping.order', 'order')
      // include products on the joined order so caller gets products with each order
      .leftJoinAndSelect('order.products', 'products')
      .where('shipping.shipperId = :shipperId', { shipperId });

    if (query.status) {
      queryBuilder.andWhere('shipping.status = :status', {
        status: query.status,
      });
    }

    if (query.from) {
      queryBuilder.andWhere('shipping.createdAt >= :from', {
        from: query.from,
      });
    }

    if (query.to) {
      queryBuilder.andWhere('shipping.createdAt <= :to', { to: query.to });
    }

    const [items, total] = await queryBuilder
      .orderBy('shipping.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach shop profile to each shipping.order if shopId present
    try {
      const shopIds = Array.from(
        new Set(
          items
            .map((it) => it.order?.shopId)
            .filter((s) => s !== undefined && s !== null),
        ),
      );

      const profiles = await Promise.all(
        shopIds.map((id) => this.djangoService.fetchShopProfile(id)),
      );

      const profileMap = new Map<string, any>();
      shopIds.forEach((id, idx) => profileMap.set(id, profiles[idx]));

      for (const it of items) {
        const shopId = it.order?.shopId;
        if (shopId) {
          // attach non-persistent shopProfile
          (it.order as any).shopProfile = profileMap.get(shopId) || null;
        }
      }
    } catch (err) {
      // don't fail the entire request if external call fails
      console.warn('Failed to attach shop profiles', err);
    }

    return new PaginatedResponseDto<Shipping>(items, total, page, limit);
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
