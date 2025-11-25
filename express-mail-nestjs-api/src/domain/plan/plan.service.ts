import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { RoutePlan } from './entities/route-plan.entity';
import { VehicleRoute } from './entities/vehicle-route.entity';
import { RouteStep, RouteStepType } from './entities/route-step.entity';
import { Order } from '../order/entities/order.entity';
import { DjangoService } from 'src/common/services/django.service';
import { CalculateRouteDto } from './dto/calculate-route.dto';
import { GetRoutePlansDto } from './dto/get-route-plans.dto';
import { AssignVehicleRoutesDto } from './dto/assign-vehicle-routes.dto';
import {
  sanitizeRoutePlans,
  sanitizeVehicleRoute,
} from './utils/plan-serializer';
import { ShippingService } from '../shipping/shipping.service';
import { ShippingStatus } from '../shipping/enums/shipping-status.enum';
import { OrderService } from '../order/order.service';
import { GetShippingPlanDto } from './dto/get-shipping-plan.dto';
import { ResShippingPlanDto } from './dto/res-shipping-plan.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(RoutePlan)
    private readonly routePlanRepository: Repository<RoutePlan>,
    @InjectRepository(VehicleRoute)
    private readonly vehicleRouteRepository: Repository<VehicleRoute>,
    @InjectRepository(RouteStep)
    private readonly routeStepRepository: Repository<RouteStep>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly djangoService: DjangoService,
    @Inject(forwardRef(() => ShippingService))
    private readonly shippingService: ShippingService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async calculateRoute(dto: CalculateRouteDto): Promise<RoutePlan> {
    // Fetch orders
    const orders = await this.orderRepository.find({
      where: dto.order_id_list.map((id) => ({ id })),
    });

    if (orders.length !== dto.order_id_list.length) {
      const foundIds = orders.map((o) => o.id);
      const missingIds = dto.order_id_list.filter(
        (id) => !foundIds.includes(id),
      );
      throw new NotFoundException(`Orders not found: ${missingIds.join(', ')}`);
    }

    // Validate orders have required fields
    const invalidOrders = orders.filter(
      (order) =>
        !order.receiver_coordinate ||
        order.length === null ||
        order.width === null ||
        order.height === null ||
        order.weight === null,
    );

    if (invalidOrders.length > 0) {
      throw new BadRequestException(
        `Orders missing required fields: ${invalidOrders.map((o) => o.id).join(', ')}`,
      );
    }

    // Get post office coordinates from Django API (with caching)
    const coordinates = await this.djangoService.getPostOfficeCoordinates(
      dto.post_office_id,
    );

    if (!coordinates.latitude || !coordinates.longitude) {
      throw new BadRequestException(
        `Post office ${dto.post_office_id} has missing coordinates`,
      );
    }

    // Build vehicles array
    const vehicles = Array.from({ length: dto.vehicles }, (_, index) => ({
      id: index,
      start: [coordinates.longitude, coordinates.latitude] as [string, string],
      end: [coordinates.longitude, coordinates.latitude] as [string, string],
      profile: 'bike',
    }));

    // Build jobs array
    const jobs = orders.map((order) => {
      // Parse receiver_coordinate (format: "lat,lon" -> convert to [lon, lat])
      const coords = order.receiver_coordinate
        .split(',')
        .map((coord) => coord.trim());

      if (coords.length !== 2) {
        throw new BadRequestException(
          `Invalid coordinate format for order ${order.id}: ${order.receiver_coordinate}. Expected format: "lat,lon"`,
        );
      }

      const [lat, lon] = coords;
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);

      if (isNaN(latNum) || isNaN(lonNum)) {
        throw new BadRequestException(
          `Invalid coordinate values for order ${order.id}: ${order.receiver_coordinate}. Coordinates must be valid numbers`,
        );
      }

      // Calculate volume (cm3) and weight (g)
      const volume = Math.round(order.length * order.width * order.height);
      const weight = Math.round(order.weight * 1000); // Convert kg to g

      return {
        id: order.id,
        location: [lon, lat] as [string, string],
        amounts: [volume, weight] as [number, number],
      };
    });

    // Call Django service
    const response = await this.djangoService.calculateVehicleRoutingProblem(
      vehicles,
      jobs,
      dto.mode,
    );

    // Save RoutePlan
    const routePlan = this.routePlanRepository.create({
      postOfficeId: dto.post_office_id,
      totalCost: response.summary?.cost || 0,
      totalDistance: response.summary?.distance || 0,
      totalDuration: response.summary?.duration || 0,
      totalServiceTime: response.summary?.service || 0,
      unassignedCount: response.summary?.unassigned || 0,
      rawResponse: response,
    });

    const savedRoutePlan = await this.routePlanRepository.save(routePlan);

    // Save VehicleRoutes and RouteSteps
    if (response.routes && Array.isArray(response.routes)) {
      for (const route of response.routes) {
        const vehicleRoute = this.vehicleRouteRepository.create({
          routePlan: savedRoutePlan,
          vehicleId: null,
          cost: route.cost || 0,
          distance: route.distance || 0,
          duration: route.duration || 0,
          serviceTime: route.service || 0,
          geometry: route.geometry || '',
          mode: dto.mode,
        });

        const savedVehicleRoute =
          await this.vehicleRouteRepository.save(vehicleRoute);

        // Save RouteSteps
        if (route.steps && Array.isArray(route.steps)) {
          for (let stepIndex = 0; stepIndex < route.steps.length; stepIndex++) {
            const step = route.steps[stepIndex];
            const stepType =
              step.type === 'start'
                ? RouteStepType.START
                : step.type === 'end'
                  ? RouteStepType.END
                  : RouteStepType.JOB;

            // Get load count (first element of load array, or 0 if not array)
            const loadCount = Array.isArray(step.load)
              ? step.load[0] || 0
              : step.load || 0;

            const routeStep = this.routeStepRepository.create({
              vehicleRoute: savedVehicleRoute,
              stepOrder: stepIndex,
              type: stepType,
              jobId: step.job || step.id || null,
              lat: Array.isArray(step.location)
                ? parseFloat(step.location[1])
                : 0,
              lng: Array.isArray(step.location)
                ? parseFloat(step.location[0])
                : 0,
              arrival: step.arrival || 0,
              duration: step.duration || 0,
              distance: step.distance || 0,
              load: loadCount,
              serviceTime: step.service || 0,
              waitingTime: step.waitingTime || 0,
            });

            const savedRouteStep =
              await this.routeStepRepository.save(routeStep);

            // Link order to route step if it's a job type
            if (stepType === RouteStepType.JOB && step.job) {
              const order = orders.find((o) => o.id === step.job);
              if (order) {
                order.routeStep = savedRouteStep;
                await this.orderRepository.save(order);
              }
            }
          }
        }
      }
    }

    // Return route plan with relations
    const routePlanWithRelations = await this.routePlanRepository.findOne({
      where: { id: savedRoutePlan.id },
      relations: ['vehicleRoutes', 'vehicleRoutes.routeSteps'],
    });

    if (!routePlanWithRelations) {
      // This should never happen, but handle it just in case
      return savedRoutePlan;
    }

    return routePlanWithRelations;
  }

  async getRoutePlans(
    dto: GetRoutePlansDto,
  ): Promise<PaginatedResponseDto<RoutePlan>> {
    const queryBuilder = this.routePlanRepository
      .createQueryBuilder('routePlan')
      .leftJoinAndSelect('routePlan.vehicleRoutes', 'vehicleRoute')
      .leftJoinAndSelect('vehicleRoute.routeSteps', 'routeStep')
      .where('routePlan.postOfficeId = :postOfficeId', {
        postOfficeId: dto.post_office_id,
      })
      .orderBy('routePlan.createdAt', 'DESC')
      .addOrderBy('vehicleRoute.id', 'ASC')
      .addOrderBy('routeStep.stepOrder', 'ASC');

    if (dto.from && dto.to) {
      queryBuilder.andWhere('routePlan.createdAt BETWEEN :from AND :to', {
        from: new Date(dto.from),
        to: new Date(dto.to),
      });
    } else if (dto.from) {
      queryBuilder.andWhere('routePlan.createdAt >= :from', {
        from: new Date(dto.from),
      });
    } else if (dto.to) {
      queryBuilder.andWhere('routePlan.createdAt <= :to', {
        to: new Date(dto.to),
      });
    } else if (dto.mode) {
      queryBuilder.andWhere('vehicleRoute.mode = :mode', {
        mode: dto.mode,
      });
    }

    const routePlans = await queryBuilder.getMany();

    // Manually sort route steps for each vehicle route to ensure correct order
    routePlans.forEach((routePlan) => {
      routePlan.vehicleRoutes?.forEach((vehicleRoute) => {
        if (vehicleRoute.routeSteps) {
          vehicleRoute.routeSteps.sort((a, b) => a.stepOrder - b.stepOrder);
        }
      });
    });

    // Use shared serializer util to sanitize the response
    const sanitized = sanitizeRoutePlans(routePlans);

    // Apply pagination from dto
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const total = sanitized.length;
    const items = sanitized.slice((page - 1) * limit, page * limit);

    return new PaginatedResponseDto<RoutePlan>(
      items as RoutePlan[],
      total,
      page,
      limit,
    );
  }

  async getVehicleRoute(
    vehicleRouteId: number,
    page = 1,
    limit = 10,
  ): Promise<{
    vehicleRoute: VehicleRoute;
    steps: PaginatedResponseDto<RouteStep>;
  }> {
    const vehicleRoute = await this.vehicleRouteRepository.findOne({
      where: { id: vehicleRouteId },
      relations: ['routePlan', 'routeSteps'],
    });

    if (!vehicleRoute) {
      throw new NotFoundException(
        `Vehicle route with ID ${vehicleRouteId} not found`,
      );
    }

    // Sort route steps by stepOrder
    if (vehicleRoute.routeSteps) {
      vehicleRoute.routeSteps.sort((a, b) => a.stepOrder - b.stepOrder);
    }

    // Use shared serializer util to sanitize vehicle route (metadata + full steps)
    const full = sanitizeVehicleRoute(vehicleRoute);

    // paginate steps
    const allSteps = full.routeSteps || [];
    const total = allSteps.length;
    const start = (page - 1) * limit;
    const paged = allSteps.slice(start, start + limit);
    const stepsPaginated = new PaginatedResponseDto<RouteStep>(
      paged as RouteStep[],
      total,
      page,
      limit,
    );

    return {
      vehicleRoute: full as VehicleRoute,
      steps: stepsPaginated,
    };
  }

  async assignVehicleRoutes(
    dto: AssignVehicleRoutesDto,
  ): Promise<VehicleRoute[]> {
    const assignedRoutes: VehicleRoute[] = [];

    for (const assignment of dto.assignments) {
      // Find vehicle route
      const vehicleRoute = await this.vehicleRouteRepository.findOne({
        where: { id: assignment.vehicle_route_id },
        relations: ['routeSteps'],
      });

      if (!vehicleRoute) {
        throw new NotFoundException(
          `Vehicle route with ID ${assignment.vehicle_route_id} not found`,
        );
      }

      // Check if already assigned
      if (vehicleRoute.vehicleId) {
        throw new BadRequestException(
          `Vehicle route ${assignment.vehicle_route_id} is already assigned to ${vehicleRoute.vehicleId}`,
        );
      }

      // Assign shipper to vehicle route
      vehicleRoute.vehicleId = assignment.shipper_id;
      const savedVehicleRoute =
        await this.vehicleRouteRepository.save(vehicleRoute);

      // Create shipping records for all JOB type route steps
      const jobSteps = vehicleRoute.routeSteps.filter(
        (step) => step.type === RouteStepType.JOB && step.jobId !== null,
      );

      for (const step of jobSteps) {
        if (step.jobId) {
          try {
            await this.shippingService.create({
              orderId: step.jobId,
              shipperId: assignment.shipper_id,
              status: ShippingStatus.PICKUP_REQUESTED,
              routeStepId: step.id,
            });
          } catch (error) {
            // Log error but continue with other steps
            console.error(
              `Failed to create shipping for order ${step.jobId}:`,
              error,
            );
          }
        }
      }

      assignedRoutes.push(savedVehicleRoute);
    }

    // Return assigned routes with relations
    const routeIds = assignedRoutes.map((route) => route.id);
    return this.vehicleRouteRepository.find({
      where: routeIds.map((id) => ({ id })),
      relations: ['routePlan', 'routeSteps'],
      order: {
        routeSteps: {
          stepOrder: 'ASC',
        },
      },
    });
  }

  async getShippingPlan(
    dto: GetShippingPlanDto,
  ): Promise<ResShippingPlanDto[]> {
    // get vehicleId from shipperId and time range
    const vehicleRoutes = await this.vehicleRouteRepository.find({
      where: {
        vehicleId: dto.shipper_id,
        createdAt: Between(new Date(dto.start_date), new Date(dto.end_date)),
        mode: dto.mode,
      },
      relations: ['routeSteps'],
    });

    // join with shipping table and order table
    const orderIds = vehicleRoutes.flatMap(
      (vehicleRoute) =>
        vehicleRoute.routeSteps?.map((routeStep) => routeStep.jobId) || [],
    );
    const validOrderIds = orderIds.filter(
      (id): id is number => id !== null && id !== undefined,
    );
    const orders = await this.orderService.findManyByIds(validOrderIds);

    // Enrich orders with shop profiles
    const enrichedOrders =
      await this.orderService.enrichOrdersWithShopProfiles(orders);

    const shippingPlan: ResShippingPlanDto[] = vehicleRoutes.map(
      (vehicleRoute): ResShippingPlanDto => {
        // Create a map of route steps by jobId for faster lookup
        const routeStepMap = new Map(
          vehicleRoute.routeSteps?.map((rs) => [rs.jobId, rs]) || [],
        );

        const filteredOrders = enrichedOrders
          .filter((order) => routeStepMap.has(order.id))
          .map((order) => {
            const routeStep = routeStepMap.get(order.id);
            console.log(`Order ${order.id} routeStep:`, routeStep);
            return {
              ...order,
              routeStep,
            };
          });

        // sort orders by routeStep.stepOrder
        filteredOrders.sort(
          (a, b) =>
            (a.routeStep?.stepOrder || 0) - (b.routeStep?.stepOrder || 0),
        );

        return {
          orders: filteredOrders as any,
          geometry: vehicleRoute.geometry,
          mode: vehicleRoute.mode,
          time: vehicleRoute.createdAt,
          distance: vehicleRoute.distance,
          duration: vehicleRoute.duration,
        };
      },
    );

    return shippingPlan;
  }
}
