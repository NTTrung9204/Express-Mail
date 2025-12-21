import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
import { RouteStep } from '../plan/entities/route-step.entity';
import { OrderStatus } from './enums/order-status.enum';
import { ShippingStatus } from './enums/shipping-status.enum';

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
    @InjectRepository(RouteStep)
    private readonly routeStepRepository: Repository<RouteStep>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly djangoService: DjangoService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async checkNearestPostOffice(
    longitude: number,
    latitude: number,
  ): Promise<boolean> {
    const distanceThreshold = 50;
    const allPostOffices = await this.djangoService.fetchAllPostOffices();
    for (const postOffice of allPostOffices) {
      const poLat = parseFloat(postOffice.latitude);
      const poLon = parseFloat(postOffice.longitude);

      const distance = this.calculateDistance(
        poLat,
        poLon,
        latitude,
        longitude,
      );

      if (distance < distanceThreshold) {
        return true;
      }
    }

    return false;
  }

  private async checkIsReadyForDelivery(
    order: Order,
    currentPostOfficeId: number,
  ): Promise<{
    isReady: boolean;
    distanceToReceiver: number;
    nearestPostOfficeDistance: number;
    nearestPostOfficeId: number;
  }> {
    try {
      // Extract receiver coordinates
      const receiverCoords = order.receiver_coordinate?.split(',');
      if (!receiverCoords || receiverCoords.length < 2) {
        return {
          isReady: false,
          distanceToReceiver: 0,
          nearestPostOfficeDistance: 0,
          nearestPostOfficeId: currentPostOfficeId,
        };
      }

      const receiverLat = parseFloat(receiverCoords[0]);
      const receiverLon = parseFloat(receiverCoords[1]);

      if (isNaN(receiverLat) || isNaN(receiverLon)) {
        return {
          isReady: false,
          distanceToReceiver: 0,
          nearestPostOfficeDistance: 0,
          nearestPostOfficeId: currentPostOfficeId,
        };
      }

      // Fetch current post office coordinates
      const currentPoCoords =
        await this.djangoService.getPostOfficeCoordinates(currentPostOfficeId);
      if (!currentPoCoords.latitude || !currentPoCoords.longitude) {
        return {
          isReady: false,
          distanceToReceiver: 0,
          nearestPostOfficeDistance: 0,
          nearestPostOfficeId: currentPostOfficeId,
        };
      }

      const currentPoLat = parseFloat(currentPoCoords.latitude);
      const currentPoLon = parseFloat(currentPoCoords.longitude);
      const currentDistance = this.calculateDistance(
        currentPoLat,
        currentPoLon,
        receiverLat,
        receiverLon,
      );

      // Fetch all post offices
      const allPostOffices = await this.djangoService.fetchAllPostOffices();

      // Find the minimum distance among all post offices and track the nearest post office ID
      let nearestDistance = currentDistance;
      let nearestPostOfficeId = currentPostOfficeId;
      for (const postOffice of allPostOffices) {
        const poLat = parseFloat(postOffice.latitude);
        const poLon = parseFloat(postOffice.longitude);

        if (isNaN(poLat) || isNaN(poLon)) {
          continue;
        }

        const distance = this.calculateDistance(
          poLat,
          poLon,
          receiverLat,
          receiverLon,
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPostOfficeId = postOffice.id;
        }
      }

      // Consider ready for delivery if current post office distance is under 50km
      const isReady = currentDistance < 50;

      return {
        isReady,
        distanceToReceiver: Math.round(currentDistance * 100) / 100,
        nearestPostOfficeDistance: Math.round(nearestDistance * 100) / 100,
        nearestPostOfficeId,
      };
    } catch (error) {
      console.error('Error checking if order is ready for delivery:', error);
      return {
        isReady: false,
        distanceToReceiver: 0,
        nearestPostOfficeDistance: 0,
        nearestPostOfficeId: currentPostOfficeId,
      };
    }
  }

  transformToOrderResponseDto(
    order: Order,
    routeSteps?: RouteStep[],
    readinessInfo?: {
      isReady: boolean;
      distanceToReceiver: number;
      nearestPostOfficeDistance: number;
      nearestPostOfficeId: number;
    },
  ): OrderResponseDto {
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
      routeSteps: routeSteps
        ? routeSteps.map((routeStep) => ({
            id: routeStep.id,
            stepOrder: routeStep.stepOrder,
            type: routeStep.type,
            jobId: routeStep.jobId,
            lat: routeStep.lat,
            lng: routeStep.lng,
            arrival: routeStep.arrival,
            duration: routeStep.duration,
            distance: routeStep.distance,
            load: routeStep.load,
            serviceTime: routeStep.serviceTime,
            waitingTime: routeStep.waitingTime,
            status: routeStep.status,
            createdAt: routeStep.createdAt,
          }))
        : undefined,
      isReadyForDelivery: readinessInfo?.isReady,
      distanceToReceiver: readinessInfo?.distanceToReceiver,
      nearestPostOfficeDistance: readinessInfo?.nearestPostOfficeDistance,
      nearestPostOfficeId: readinessInfo?.nearestPostOfficeId,
      deleted_at: order.deleted_at ?? undefined,
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

      const isReadyPickup = await this.checkNearestPostOffice(
        parseFloat(receiverLongitude),
        parseFloat(receiverLatitude),
      );

      if (!isReadyPickup) {
        throw new BadRequestException(
          'Không có bưu cục gần địa chỉ người nhận, vui lòng kiểm tra lại.',
        );
      }

      Logger.log(
        `Fetching shipping rates for coordinates: ${receiverLatitude}, ${receiverLongitude}`,
      );
      let shippingCostInformation: ShippingCostInformationDto;
      try {
        shippingCostInformation = await this.djangoService.fetchShippingRates(
          createOrderDto.length,
          createOrderDto.width,
          createOrderDto.height,
          createOrderDto.weight,
          jwtPayload?.postOfficeId || '',
          receiverLatitude,
          receiverLongitude,
        );
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        throw new BadRequestException(
          'Không tìm thấy đường đi, vui lòng chọn lại địa chỉ người nhận.',
        );
      }
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
        receiver_name: createOrderDto.receiver_name,
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

      // Handle BadRequest exceptions (validation errors, business logic errors)
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle other exceptions
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle system/database errors
      Logger.error('System error while creating order:', error);
      throw new InternalServerErrorException(
        error.message || 'An error occurred while creating the order',
      );
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

      // Map profiles by shop ID
      const profileMap = new Map<string, ShopProfileDto>();
      shopIds.forEach((id, idx) => {
        if (profiles[idx]) {
          profileMap.set(id, profiles[idx]);
        }
      });

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

  async findByShopIdPaginated(
    shopId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { shopId },
      relations: ['products', 'transitions', 'orderPostOffices', 'shipping'],
      withDeleted: false,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    // Enrich with shop profiles
    const enrichedOrders = await this.enrichOrdersWithShopProfiles(orders);

    // Transform orders
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

    // Fetch all orders with relations
    const allOrders = await this.orderRepository.find({
      where: {},
      relations: ['products', 'shipping', 'transitions', 'orderPostOffices'],
      withDeleted: false,
    });

    // Filter orders: get the latest event from all sources and check its status
    let filteredOrders = allOrders.filter((order) => {
      if (!status) return true;

      console.log('Filtering order ID:', order.id);
      console.log('Order status:', order.order_status);
      // Exclude completed orders
      if (order.order_status === OrderStatus.COMPLETED) return false;

      // Get latest event from all 3 sources
      const latestEvent = this.getLatestEventAcrossAllSources(
        order,
        postOfficeId,
      );

      if (!latestEvent) return false;

      // Get the status of the latest event
      const eventStatus = latestEvent.status;
      if (
        status === PostOfficeOrderStatus.IN_COMING &&
        postOfficeId == latestEvent?.nextPostOfficeId
      ) {
        return true;
      }

      if (
        status === PostOfficeOrderStatus.CLASSIFIED &&
        postOfficeId == latestEvent?.currentPostOfficeId &&
        eventStatus === OrderTransitionStatus.PENDING
      ) {
        return true;
      }

      if (
        status === PostOfficeOrderStatus.TRANSITING &&
        postOfficeId == latestEvent?.currentPostOfficeId
      ) {
        return true;
      }

      if (
        status === PostOfficeOrderStatus.PICKUP_REQUESTED &&
        eventStatus === OrderPostOfficeStatus.PICKUP_REQUESTED
      ) {
        return true;
      }

      if (
        status === PostOfficeOrderStatus.IN_WAREHOUSE &&
        eventStatus == PostOfficeOrderStatus.IN_WAREHOUSE &&
        ((order.order_status !== OrderStatus.CANCELED &&
          order.shipping_status === ShippingStatus.FINISHED) ||
          order.shipping_status === ShippingStatus.DELIVERY_FAILED ||
          (order.order_status === OrderStatus.CANCELED &&
            order.shipping_status !== ShippingStatus.FINISHED))
      ) {
        return true;
      }
    });

    // Sort by latest event timestamp (descending - newest first)
    filteredOrders = filteredOrders.sort((a, b) => {
      const latestEventA = this.getLatestEventAcrossAllSources(a, postOfficeId);
      const latestEventB = this.getLatestEventAcrossAllSources(b, postOfficeId);

      const timestampA = latestEventA
        ? new Date(latestEventA.created_at || latestEventA.createdAt).getTime()
        : 0;
      const timestampB = latestEventB
        ? new Date(latestEventB.created_at || latestEventB.createdAt).getTime()
        : 0;

      return timestampB - timestampA;
    });

    // Get total count before pagination
    const total = filteredOrders.length;

    // Apply pagination
    const paginatedOrders = filteredOrders.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Enrich orders with shop profiles
    const enrichedOrders =
      await this.enrichOrdersWithShopProfiles(paginatedOrders);

    // Fetch route steps if status is PICKUP_REQUESTED
    const routeStepMap = new Map<number, RouteStep[]>();
    if (
      status === PostOfficeOrderStatus.PICKUP_REQUESTED ||
      status === PostOfficeOrderStatus.IN_WAREHOUSE
    ) {
      const orderIds = enrichedOrders.map((order) => order.id);
      if (orderIds.length > 0) {
        const routeSteps = await this.routeStepRepository.find({
          where: { jobId: In(orderIds) },
        });
        routeSteps.forEach((step) => {
          if (step.jobId !== null) {
            const steps = routeStepMap.get(step.jobId) ?? [];
            steps.push(step);
            routeStepMap.set(step.jobId, steps);
          }
        });
      }
    }

    // Check if orders are ready for delivery if status is IN_WAREHOUSE
    const readinessMap = new Map<
      number,
      {
        isReady: boolean;
        distanceToReceiver: number;
        nearestPostOfficeDistance: number;
        nearestPostOfficeId: number;
      }
    >();
    if (
      status === PostOfficeOrderStatus.IN_WAREHOUSE ||
      status === PostOfficeOrderStatus.CLASSIFIED
    ) {
      for (const order of enrichedOrders) {
        const readinessInfo = await this.checkIsReadyForDelivery(
          order,
          postOfficeId,
        );
        readinessMap.set(order.id, readinessInfo);
      }
    }

    // Transform orders and return paginated response
    const items = enrichedOrders.map((order) =>
      this.transformToOrderResponseDto(
        order,
        routeStepMap.get(order.id),
        readinessMap.get(order.id),
      ),
    );

    return new PaginatedResponseDto<OrderResponseDto>(
      items,
      total,
      page,
      limit,
    );
  }

  private getLatestEventAcrossAllSources(
    order: Order,
    postOfficeId: number,
  ): any {
    const allRelevantEvents: any[] = [];

    // Add orderPostOffices events for this post office
    if (order.orderPostOffices) {
      allRelevantEvents.push(
        ...order.orderPostOffices.filter(
          (opo) => String(opo.postOfficeId) === String(postOfficeId),
        ),
      );
    }

    // Add transitions events for this post office
    // Include TRANSITING transitions where currentPostOfficeId or nextPostOfficeId matches
    if (order.transitions) {
      allRelevantEvents.push(
        ...order.transitions.filter(
          (trans) =>
            (String(trans.status) === 'TRANSITING' &&
              (String(trans.currentPostOfficeId) === String(postOfficeId) ||
                String(trans.nextPostOfficeId) === String(postOfficeId))) ||
            String(trans.currentPostOfficeId) === String(postOfficeId),
        ),
      );
    }

    if (allRelevantEvents.length === 0) return null;

    // Sort by created_at/createdAt and return the latest
    return allRelevantEvents.sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt).getTime() -
        new Date(a.created_at || a.createdAt).getTime(),
    )[0];
  }

  async findPickupOrders(
    postOfficeId: string,
    page: number = 1,
    limit: number = 10,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    // First, get order IDs that match criteria using subquery
    const orderIdsQuery = this.orderTransitionRepository
      .createQueryBuilder('transition')
      .select('DISTINCT transition.order_id', 'order_id')
      .where('transition.current_post_office IS NULL')
      .andWhere('transition.next_post_office = :postOfficeId', { postOfficeId })
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('MAX(ot.id)')
          .from(OrderTransition, 'ot')
          .where('ot.order_id = transition.order_id')
          .andWhere('ot.deleted_at IS NULL')
          .getQuery();

        return `transition.id = ${sub}`;
      });

    // Apply date filters
    if (fromDate) {
      orderIdsQuery.andWhere('transition.created_at >= :fromDate', {
        fromDate,
      });
    }
    if (toDate) {
      orderIdsQuery.andWhere('transition.created_at <= :toDate', { toDate });
    }

    // Get total count and order data with createdAt for sorting
    const orderData = await orderIdsQuery
      .addSelect('transition.created_at', 'created_at')
      .getRawMany();

    const total = orderData.length;

    // Sort by created_at DESC
    const sortedOrderData = orderData.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Apply pagination
    const paginatedOrderIds = sortedOrderData
      .slice((page - 1) * limit, page * limit)
      .map((row) => row.order_id);

    // Fetch full orders with relations
    const orders =
      paginatedOrderIds.length > 0
        ? await this.orderRepository.find({
            where: { id: In(paginatedOrderIds) },
            relations: ['products', 'shipping', 'transitions'],
          })
        : [];

    // Enrich with shop profiles
    const enrichedOrders = await this.enrichOrdersWithShopProfiles(orders);

    // Transform orders
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
