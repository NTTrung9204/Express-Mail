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
import { ShippingStatus } from './enums/shipping-status.enum';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/enums/order-status.enum';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
    private readonly djangoService: DjangoService,
    private readonly orderService: OrderService,
  ) {}

  async create(createShippingDto: CreateShippingDto): Promise<Shipping> {
    try {
      if (createShippingDto.status === ShippingStatus.FINISHED) {
        const latestShipping =
          await this.orderService.getLastestShippingByOrderId(
            createShippingDto.orderId,
          );
        console.log('Latest shipping:', latestShipping);
        if (
          latestShipping &&
          latestShipping.status === ShippingStatus.SHIPPING
        ) {
          await this.orderService.update(createShippingDto.orderId, {
            order_status: OrderStatus.COMPLETED,
          });
        }
      }

      const shipping = this.shippingRepository.create({
        shipperId: createShippingDto.shipperId,
        status: createShippingDto.status,
        order: { id: createShippingDto.orderId } as any,
      });
      const savedShipping = await this.shippingRepository.save(shipping);

      return savedShipping;
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

    // First get the latest shipping records for each order
    const latestShippingsQuery = this.shippingRepository
      .createQueryBuilder('s')
      .select([
        's.order_id as order_id',
        'MAX(s.created_at) as latest_created_at',
      ])
      .where('s.shipper_id = :shipperId', { shipperId })
      .groupBy('s.order_id');

    console.log('Latest Shippings Query:', latestShippingsQuery.getSql());

    // Apply time filters if provided
    if (query.from) {
      latestShippingsQuery.andWhere('s.created_at >= :from', {
        from: query.from,
      });
    }
    if (query.to) {
      latestShippingsQuery.andWhere('s.created_at <= :to', {
        to: query.to,
      });
    }

    // Get the latest shipping records with all their data
    const shippingQuery = this.shippingRepository
      .createQueryBuilder('shipping')
      .select([
        'shipping.id as shipping_id',
        'shipping.shipper_id as shipping_shipper_id',
        'shipping.order_id as shipping_order_id',
        'shipping.status as shipping_status',
        'shipping.created_at as shipping_created_at',
        'shipping.updated_at as shipping_updated_at',
        'shipping.deleted_at as shipping_deleted_at',
      ])
      .innerJoin(
        `(${latestShippingsQuery.getQuery()})`,
        'latest',
        'shipping.order_id = latest.order_id AND shipping.created_at = latest.latest_created_at',
      )
      .setParameters(latestShippingsQuery.getParameters());

    // Apply status filter if provided
    if (query.status) {
      shippingQuery.andWhere('shipping.status = :status', {
        status: query.status,
      });
    }

    // Count total before pagination
    const total = await shippingQuery.getCount();

    console.log('total', total);

    // Apply pagination and get results
    const shippings = await shippingQuery
      .orderBy('shipping.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    // Transform raw results to Shipping entities
    const transformedShippings = shippings.map((raw) => {
      console.log('Raw shipping:', raw); // Debug log
      const shipping = new Shipping();
      shipping.id = raw['shipping_id'];
      shipping.shipperId = raw['shipping_shipper_id'];
      shipping.order = { id: raw['shipping_order_id'] } as any;
      shipping.status = raw['shipping_status'];
      shipping.createdAt = raw['shipping_created_at'];
      shipping.updatedAt = raw['shipping_updated_at'];
      shipping.deletedAt = raw['shipping_deleted_at'];
      return shipping;
    });

    console.log('transformedShippings', transformedShippings);

    // Get order IDs and fetch orders
    const orderIds = transformedShippings.map((s) => s.order['id']);
    console.log('orderIds', orderIds);
    const orders = await this.orderService.findManyByIds(orderIds);
    console.log('orders', orders);

    // Map orders back to shippings
    const ordersMap = new Map(orders.map((order) => [order.id, order]));
    const items = transformedShippings.map((shipping) => {
      const order = ordersMap.get(shipping.order['id']);
      if (order) {
        shipping.order = order;
      }
      return shipping;
    });

    console.log('items', items);

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
