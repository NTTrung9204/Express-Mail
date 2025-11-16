import { Test, TestingModule } from '@nestjs/testing';
import { PlanService } from './plan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoutePlan } from './entities/route-plan.entity';
import { VehicleRoute } from './entities/vehicle-route.entity';
import { RouteStep } from './entities/route-step.entity';
import { Order } from '../order/entities/order.entity';
import { DjangoService } from 'src/common/services/django.service';
import { ShippingService } from '../shipping/shipping.service';
import { OrderService } from '../order/order.service';

describe('PlanService', () => {
  let service: PlanService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDjangoService = {
    getData: jest.fn(),
    postData: jest.fn(),
  };

  const mockShippingService = {
    createShipping: jest.fn(),
    updateShippingStatus: jest.fn(),
  };

  const mockOrderService = {
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,

        { provide: getRepositoryToken(RoutePlan), useValue: mockRepository },
        { provide: getRepositoryToken(VehicleRoute), useValue: mockRepository },
        { provide: getRepositoryToken(RouteStep), useValue: mockRepository },
        { provide: getRepositoryToken(Order), useValue: mockRepository },

        { provide: DjangoService, useValue: mockDjangoService },
        { provide: ShippingService, useValue: mockShippingService },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
