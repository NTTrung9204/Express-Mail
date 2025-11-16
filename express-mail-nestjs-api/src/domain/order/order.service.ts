import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { PostOfficeOrderStatus } from './dto/post-office-orders-query.dto';
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
import { DjangoService } from 'src/common/services/django.service';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { ShippingCostInformationDto } from '../shipping/dto/shipping-cost-information.dto';
import { TransitionOrderDto } from './dto/transition-order.dto';
import { OrderPostOfficeDto } from './dto/order-post-office.dto';
import { Shipping } from '../shipping/entities/shipping.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { ShopProfileDto } from '../shop/dto/shop-profile.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderTransition)
    private readonly orderTransitionRepository: Repository<OrderTransition>,
    @InjectRepository(OrderPostOffice)
    private readonly orderPostOfficeRepository: Repository<OrderPostOffice>,
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly djangoService: DjangoService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  transformToOrderResponseDto(order: Order): OrderResponseDto {
    console.log('fetched shop profile for order', (order as any).shopProfile);
    return {
      ...order,
      shipping: order.shipping?.map((ship: Shipping) => ({
        id: ship.id,
        shipperId: ship.shipperId,
        orderId: order.id,
        status: ship.status,
        createdAt: ship.createdAt,
        updatedAt: ship.updatedAt,
      })),
      deleted_at: order.deleted_at ?? undefined,
      shopProfile: (order as any).shopProfile,
    } as OrderResponseDto;
  }

  async create(
    createOrderDto: CreateOrderDto,
    jwtPayload: JwtPayload,
    files?: Express.Multer.File[],
  ): Promise<Order> {
    console.log('createOrderDto', createOrderDto.products);
    try {
      // Process file uploads if provided
      const fileMap: Map<number, string> = new Map();
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          try {
            const fileUrl = this.fileUploadService.saveFile(file);
            fileMap.set(index, fileUrl);
          } catch (error) {
            console.warn(`Failed to upload file at index ${index}:`, error);
          }
        });
      }

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

      const [receiverLatitude = '', receiverLongitude = ''] =
        createOrderDto.receiver_coordinate?.split(',').map((s) => s.trim()) ||
        [];

      Logger.log(
        `Fetching shipping rates for coordinates: ${receiverLatitude}, ${receiverLongitude}`,
      );
      const shippingCostInformation: ShippingCostInformationDto =
        await this.djangoService.fetchShippingRates(
          createOrderDto.length,
          createOrderDto.width,
          createOrderDto.height,
          createOrderDto.weight,
          jwtPayload?.postOfficeId || '',
          receiverLatitude,
          receiverLongitude,
        );
      Logger.log(
        `Received shipping cost information: ${JSON.stringify(
          shippingCostInformation,
        )}`,
      );

      // Create order
      const orderData: DeepPartial<Order> = {
        code: orderCode,
        shopId: String(jwtPayload.userId),
        shippingFeeId: shippingCostInformation.shippingRateId,
        receiver_phone: createOrderDto.receiver_phone,
        receiver_province_city: createOrderDto.receiver_province_city,
        receiver_ward_commune: createOrderDto.receiver_ward_commune,
        receiver_address: createOrderDto.receiver_address,
        receiver_coordinate: createOrderDto.receiver_coordinate,
        receiver_district: createOrderDto.receiver_district,
        length: createOrderDto.length,
        width: createOrderDto.width,
        height: createOrderDto.height,
        weight: createOrderDto.weight,
        cod: createOrderDto.cod,
        shipping_cost: shippingCostInformation.totalFee,
        shipping_cost_payper: 0,
        is_receiver_pay_shipping: createOrderDto.is_receiver_pay_shipping,
      };

      const order = this.orderRepository.create(orderData);

      const savedOrder = await this.orderRepository.save(order);

      // Create order transition
      const orderTransition = new OrderTransition();
      orderTransition.order = savedOrder;
      orderTransition.currentPostOfficeId = null;
      orderTransition.nextPostOfficeId =
        jwtPayload?.postOfficeId?.toString() || null;
      orderTransition.status = OrderTransitionStatus.PENDING;

      await this.orderTransitionRepository.save(orderTransition);

      // Create order post office
      const orderPostOffice = this.orderPostOfficeRepository.create({
        order: savedOrder,
        postOfficeId: jwtPayload?.postOfficeId?.toString(),
        status: OrderPostOfficeStatus.PICKUP_REQUESTED,
      });

      await this.orderPostOfficeRepository.save(orderPostOffice);

      // Create products with uploaded images
      for (let i = 0; i < createOrderDto.products.length; i++) {
        const productData = createOrderDto.products[i];
        const imageUrl = fileMap.get(i);
        await this.productService.create({
          ...productData,
          orderId: savedOrder.id,
          img_url: imageUrl,
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
      .leftJoinAndSelect('order.shipping', 'shipping')
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

    // Enrich orders with shop profiles
    const enrichedItems = await this.enrichOrdersWithShopProfiles(items);

    return new PaginatedResponseDto<Order>(enrichedItems, total, page, limit);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Enrich with shop profile
    const enriched = await this.enrichOrdersWithShopProfiles([order]);
    return enriched[0];
  }

  async findManyByIds(ids: number[]): Promise<Order[]> {
    if (!ids || ids.length === 0) return [];

    return await this.orderRepository.find({
      where: { id: In(ids) },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
    });
  }

  /**
   * Enrich orders with shop profile information from Django API
   */
  async enrichOrdersWithShopProfiles(orders: Order[]): Promise<Order[]> {
    if (!orders || orders.length === 0) return [];

    try {
      // Get unique shop IDs
      const shopIds = Array.from(
        new Set(
          orders
            .map((o) => o.shopId)
            .filter((id) => id !== undefined && id !== null),
        ),
      );

      console.log('shopIds', shopIds);

      if (shopIds.length === 0) return orders;

      // Fetch shop profiles in parallel
      const profiles = await Promise.all(
        shopIds.map((shopId) =>
          this.djangoService.fetchShopProfile(shopId).catch((err) => {
            console.warn(`Failed to fetch shop profile for ${shopId}:`, err);
            return null;
          }),
        ),
      );

      console.log('profiles', profiles);

      // Map profiles by shop ID
      const profileMap = new Map<string, ShopProfileDto>();
      shopIds.forEach((id, idx) => {
        if (profiles[idx]) {
          profileMap.set(id, profiles[idx]);
        }
      });

      console.log('profileMap', profileMap);

      // Attach shop profile to each order
      return orders.map((order) => ({
        ...order,
        shopProfile: profileMap.get(order.shopId) || null,
      }));
    } catch (err) {
      console.warn('Failed to enrich orders with shop profiles:', err);
      return orders;
    }
  }

  async findByCode(code: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { code },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
    });

    if (!order) {
      throw new NotFoundException(`Order with code ${code} not found`);
    }

    // Enrich with shop profile
    const enriched = await this.enrichOrdersWithShopProfiles([order]);
    return enriched[0];
  }

  async findByShopId(shopId: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { shopId },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
    });

    // Enrich with shop profiles
    return this.enrichOrdersWithShopProfiles(orders);
  }

  async findByOrderStatus(orderStatus: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { order_status: orderStatus as any },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
    });

    // Enrich with shop profiles
    return this.enrichOrdersWithShopProfiles(orders);
  }

  async findByShippingStatus(shippingStatus: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { shipping_status: shippingStatus as any },
      relations: ['products', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });

    // Enrich with shop profiles
    return this.enrichOrdersWithShopProfiles(orders);
  }

  /**
   * Find orders assigned to a given shipperId with optional shipping status and date range, paginated
   */
  async findByShipperId(
    shipperId: string,
    query?: any,
  ): Promise<PaginatedResponseDto<Order>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.shipping', 'shipping')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('order.transitions', 'transitions')
      .leftJoinAndSelect('order.orderPostOffices', 'orderPostOffices')
      .where('order.deleted_at IS NULL')
      .andWhere('shipping.deleted_at IS NULL')
      .andWhere('shipping.shipper_id = :shipperId', { shipperId });

    if (query?.shipping_status) {
      qb.andWhere('shipping.status = :status', {
        status: query.shipping_status,
      });
    }

    if (query?.from) {
      qb.andWhere('shipping.created_at >= :from', { from: query.from });
    }

    if (query?.to) {
      qb.andWhere('shipping.created_at <= :to', { to: query.to });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Enrich with shop profiles
    const enrichedItems = await this.enrichOrdersWithShopProfiles(items);

    return new PaginatedResponseDto<Order>(enrichedItems, total, page, limit);
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

  async transitionOrder(transitionOrderDto: TransitionOrderDto) {
    const order = await this.findOne(Number(transitionOrderDto.orderId));

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${transitionOrderDto.orderId} not found`,
      );
    }

    try {
      const orderTransition = new OrderTransition();
      orderTransition.order = order;
      orderTransition.currentPostOfficeId =
        transitionOrderDto.currentPostOfficeId || null;
      orderTransition.nextPostOfficeId =
        transitionOrderDto.nextPostOfficeId || null;
      orderTransition.status = transitionOrderDto.status;

      await this.orderTransitionRepository.save(orderTransition);

      return await this.findOne(order.id);
    } catch (error) {
      console.error('Error transitioning order:', error);
      throw new BadRequestException('Failed to transition order');
    }
  }

  async getLastestTransitionByOrderId(
    orderId: number,
  ): Promise<OrderTransition> {
    try {
      const transitions = await this.orderTransitionRepository.find({
        where: { order: { id: orderId } },
        order: { createdAt: 'DESC' },
        take: 1,
      });
      return transitions[0];
    } catch (error) {
      console.error('Error fetching latest transition:', error);
      throw new BadRequestException('Failed to fetch latest transition');
    }
  }

  async getLastestShippingByOrderId(orderId: number): Promise<Shipping> {
    try {
      const shippings = await this.shippingRepository.find({
        where: { order: { id: orderId } },
        order: { createdAt: 'DESC' },
        take: 1,
      });
      return shippings[0];
    } catch (error) {
      console.error('Error fetching latest shipping:', error);
      throw new BadRequestException('Failed to fetch latest shipping');
    }
  }

  async createOrderPostOffice(orderPostOfficeDto: OrderPostOfficeDto) {
    const order = await this.findOne(Number(orderPostOfficeDto.orderId));

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderPostOfficeDto.orderId} not found`,
      );
    }

    try {
      if (orderPostOfficeDto.status === OrderPostOfficeStatus.IN_WAREHOUSE) {
        const latestTransition = await this.getLastestTransitionByOrderId(
          orderPostOfficeDto.orderId,
        );

        const orderTransition = new OrderTransition();
        orderTransition.order = order;
        orderTransition.currentPostOfficeId =
          latestTransition.currentPostOfficeId || null;
        orderTransition.nextPostOfficeId =
          latestTransition.nextPostOfficeId || null;
        orderTransition.status = OrderTransitionStatus.DONE;

        await this.orderTransitionRepository.save(orderTransition);
      }

      const orderPostOffice = this.orderPostOfficeRepository.create({
        order: order,
        postOfficeId: orderPostOfficeDto.postOfficeId,
        status: orderPostOfficeDto.status,
      });
      await this.orderPostOfficeRepository.save(orderPostOffice);

      return await this.findOne(order.id);
    } catch (error) {
      console.error('Error creating order-post-office association:', error);
      throw new BadRequestException(
        'Failed to create order-post-office association',
      );
    }
  }

  async findOrdersByPostOffice(
    postOfficeId: number,
    status?: PostOfficeOrderStatus,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    let orderIds: number[] = [];

    if (status === PostOfficeOrderStatus.TRANSITING) {
      // Handle TRANSITING status
      const transitingOrders = await this.orderTransitionRepository
        .createQueryBuilder('ot')
        .select('DISTINCT ot.order_id', 'order_id')
        .where('ot.next_post_office = :postOfficeId', { postOfficeId })
        .andWhere('ot.status = :status', {
          status: OrderTransitionStatus.TRANSITING,
        })
        .getRawMany();

      if (transitingOrders.length > 0) {
        const orderIdsToCheck = transitingOrders.map((t) => t.order_id);

        // Get all DONE transitions for these orders
        const doneTransitions = await this.orderTransitionRepository
          .createQueryBuilder('ot')
          .select('ot.order_id', 'order_id')
          .where('ot.order_id IN (:...orderIds)', { orderIds: orderIdsToCheck })
          .andWhere('ot.next_post_office = :postOfficeId', { postOfficeId })
          .andWhere('ot.status = :status', {
            status: OrderTransitionStatus.DONE,
          })
          .getRawMany();

        // Filter out orders that have DONE status
        const doneOrderIds = new Set(doneTransitions.map((t) => t.order_id));
        orderIds = orderIdsToCheck.filter(
          (orderId) => !doneOrderIds.has(orderId),
        );
      }
    } else {
      // Handle other statuses (IN_WAREHOUSE, PICKUP_REQUESTED, CLASSIFIED)
      const latestRecords = await this.orderPostOfficeRepository
        .createQueryBuilder('opo')
        .innerJoin(
          (qb) =>
            qb
              .select('sub.order_id', 'order_id')
              .addSelect('MAX(sub.created_at)', 'max_created_at')
              .from(OrderPostOffice, 'sub')
              .where('sub.postOfficeId = :postOfficeId', { postOfficeId })
              .groupBy('sub.order_id'),
          'latest',
          'latest.order_id = opo.order_id AND latest.max_created_at = opo.created_at',
        )
        .where('opo.postOfficeId = :postOfficeId', { postOfficeId })
        .andWhere('opo.status = :status', { status })
        .getRawMany();

      orderIds = latestRecords.map((record) => record.opo_order_id);
    }

    // Count total records
    const total = orderIds.length;

    // Apply pagination
    const paginatedOrderIds = orderIds.slice((page - 1) * limit, page * limit);

    // Fetch full order details for paginated IDs
    const orders =
      paginatedOrderIds.length > 0
        ? await this.orderRepository.find({
            where: { id: In(paginatedOrderIds) },
            relations: ['products', 'shipping', 'orderPostOffices'],
          })
        : [];

    // Enrich orders with shop profiles
    const enrichedOrders = await this.enrichOrdersWithShopProfiles(orders);

    // Transform orders and return paginated response
    const items = enrichedOrders.map((order) =>
      this.transformToOrderResponseDto(order),
    );

    return new PaginatedResponseDto<OrderResponseDto>(
      items,
      total,
      page,
      limit,
    );
  }
}
