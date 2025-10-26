import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderTransition } from './entities/order-transition.entity';
import { OrderPostOffice } from './entities/post-office-order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { OrderCodeGenerator } from './utils/order-code-generator.util';
import { OrderTransitionStatus } from './enums/order-transition-status.enum';
import { OrderPostOfficeStatus } from './enums/order-post-office-status.enum';
import { ProductService } from '../product/product.service';
import { JwtPayload } from 'src/common/@type/jwt-payload.type';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderTransition)
    private readonly orderTransitionRepository: Repository<OrderTransition>,
    @InjectRepository(OrderPostOffice)
    private readonly orderPostOfficeRepository: Repository<OrderPostOffice>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    jwtPayload: JwtPayload,
  ): Promise<Order> {
    try {
      // Generate unique order code
      let orderCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        orderCode = OrderCodeGenerator.generate();
        const existingOrder = await this.orderRepository.findOne({
          where: { code: orderCode },
        });
        isUnique = !existingOrder;
        attempts++;
      } while (!isUnique && attempts < maxAttempts);

      if (!isUnique) {
        throw new BadRequestException('Unable to generate unique order code');
      }

      // Create order
      const order = this.orderRepository.create({
        code: orderCode,
        shopId: jwtPayload.userId.toString(),
        shippingFeeId: createOrderDto.shippingFeeId,
        receiver_phone: createOrderDto.receiver_phone,
        receiver_province_city: createOrderDto.receiver_province_city,
        receiver_ward_commune: createOrderDto.receiver_ward_commune,
        receiver_address: createOrderDto.receiver_address,
        receiver_coordinate: createOrderDto.receiver_coordinate,
        length: createOrderDto.length,
        width: createOrderDto.width,
        height: createOrderDto.height,
        weight: createOrderDto.weight,
        cod: createOrderDto.cod,
        shipping_cost: createOrderDto.shipping_cost,
        shipping_cost_payper: createOrderDto.shipping_cost_payper,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Create order transition
      const orderTransition = new OrderTransition();
      orderTransition.order = savedOrder;
      orderTransition.currentPostOfficeId = null;
      orderTransition.nextPostOfficeId = jwtPayload.shopId?.toString() || null;
      orderTransition.status = OrderTransitionStatus.PENDING;

      await this.orderTransitionRepository.save(orderTransition);

      // Create order post office
      const orderPostOffice = this.orderPostOfficeRepository.create({
        order: savedOrder,
        postOfficeId:
          jwtPayload.shopId?.toString() || jwtPayload.userId.toString(),
        status: OrderPostOfficeStatus.PICKUP_REQUESTED,
      });

      await this.orderPostOfficeRepository.save(orderPostOffice);

      // Create products
      for (const productData of createOrderDto.products) {
        await this.productService.create({
          ...productData,
          orderId: savedOrder.id,
        });
      }

      // Return order with relations
      return await this.findOne(savedOrder.id);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async findAll(query?: OrderQueryDto): Promise<PaginatedResponseDto<Order>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('order.transitions', 'transitions')
      .leftJoinAndSelect('order.orderPostOffices', 'orderPostOffices')
      .where('order.deleted_at IS NULL');

    if (query?.code) {
      queryBuilder.andWhere('order.code = :code', { code: query.code });
    }

    if (query?.shopId) {
      queryBuilder.andWhere('order.shop_id = :shopId', {
        shopId: query.shopId,
      });
    }

    if (query?.order_status) {
      queryBuilder.andWhere('order.order_status = :orderStatus', {
        orderStatus: query.order_status,
      });
    }

    if (query?.shipping_status) {
      queryBuilder.andWhere('order.shipping_status = :shippingStatus', {
        shippingStatus: query.shipping_status,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto<Order>(items, total, page, limit);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByCode(code: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { code },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });

    if (!order) {
      throw new NotFoundException(`Order with code ${code} not found`);
    }

    return order;
  }

  async findByShopId(shopId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { shopId },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });
  }

  async findByOrderStatus(orderStatus: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { order_status: orderStatus as any },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });
  }

  async findByShippingStatus(shippingStatus: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { shipping_status: shippingStatus as any },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Update order fields
    Object.assign(order, updateOrderDto);

    try {
      const updatedOrder = await this.orderRepository.save(order);

      if (!updatedOrder) {
        throw new BadRequestException('Failed to update order');
      }

      return await this.findOne(updatedOrder.id);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new BadRequestException('Failed to update order');
    }
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    try {
      await this.orderRepository.softDelete(id);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new BadRequestException('Failed to delete order');
    }
  }
}
