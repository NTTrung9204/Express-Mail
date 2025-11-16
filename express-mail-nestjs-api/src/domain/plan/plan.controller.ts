import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PlanService } from './plan.service';
import { CalculateRouteDto } from './dto/calculate-route.dto';
import { GetRoutePlansDto } from './dto/get-route-plans.dto';
import { AssignVehicleRoutesDto } from './dto/assign-vehicle-routes.dto';
import { RoutePlan } from './entities/route-plan.entity';
import { VehicleRoute } from './entities/vehicle-route.entity';
import { GetShippingPlanDto } from './dto/get-shipping-plan.dto';
import { ResShippingPlanDto } from './dto/res-shipping-plan.dto';

@ApiTags('plan')
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('calculate-route')
  @ApiOperation({
    summary: 'Calculate optimal route for vehicle routing problem',
    description:
      'Calculate the shortest route for pickup or delivery using vehicle routing problem algorithm',
  })
  @ApiResponse({
    status: 201,
    description: 'Route calculated successfully',
    type: RoutePlan,
  })
  @ApiResponse({ status: 404, description: 'Orders not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async calculateRoute(
    @Body() calculateRouteDto: CalculateRouteDto,
  ): Promise<RoutePlan> {
    return this.planService.calculateRoute(calculateRouteDto);
  }

  @Get('route-plans')
  @ApiOperation({
    summary: 'Get route plans by post office ID and time range',
    description:
      'Get list of route plans filtered by post office ID and optional time range, including vehicle routes and route steps',
  })
  @ApiResponse({
    status: 200,
    description: 'Route plans retrieved successfully',
    type: [RoutePlan],
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getRoutePlans(
    @Query() query: GetRoutePlansDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<RoutePlan>>> {
    const paginated = await this.planService.getRoutePlans(query);
    return new ApiResponseDto(
      true,
      'Route plans retrieved successfully',
      paginated,
    );
  }

  @Get('vehicle-route/:id')
  @ApiOperation({
    summary: 'Get vehicle route by ID',
    description: 'Get a single vehicle route with its route steps',
  })
  @ApiParam({
    name: 'id',
    description: 'Vehicle route ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle route retrieved successfully',
    type: VehicleRoute,
  })
  @ApiResponse({ status: 404, description: 'Vehicle route not found' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getVehicleRoute(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination: PaginationDto,
  ): Promise<
    ApiResponseDto<{ vehicleRoute: any; steps: PaginatedResponseDto<any> }>
  > {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const result = await this.planService.getVehicleRoute(id, page, limit);
    return new ApiResponseDto(
      true,
      'Vehicle route retrieved successfully',
      result,
    );
  }

  @Post('assign-vehicle-routes')
  @ApiOperation({
    summary: 'Assign vehicle routes to shippers',
    description:
      'Assign vehicle routes to shippers and create shipping records for all job steps in the routes',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle routes assigned successfully',
    type: [VehicleRoute],
  })
  @ApiResponse({ status: 404, description: 'Vehicle route not found' })
  @ApiResponse({ status: 400, description: 'Vehicle route already assigned' })
  async assignVehicleRoutes(
    @Body() assignVehicleRoutesDto: AssignVehicleRoutesDto,
  ): Promise<VehicleRoute[]> {
    return this.planService.assignVehicleRoutes(assignVehicleRoutesDto);
  }

  @Get('shipping-plan')
  @ApiOperation({
    summary: 'Get shipping route steps by post office ID and time range',
    description:
      'Get list of shipping route steps filtered by post office ID and optional time range',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping route steps retrieved successfully',
    type: [ResShippingPlanDto],
  })
  async getShippingPlan(
    @Query() query: GetShippingPlanDto,
  ): Promise<ResShippingPlanDto[]> {
    return this.planService.getShippingPlan(query);
  }
}
