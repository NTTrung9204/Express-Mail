import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './shipping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { Repository } from 'typeorm';
import { DjangoService } from 'src/common/services/django.service';
import { OrderService } from '../order/order.service';
import { RouteStep } from '../plan/entities/route-step.entity';

describe('ShippingService', () => {
  let service: ShippingService;
  let repository: Repository<Shipping>;

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

  const mockOrderService = {
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: getRepositoryToken(Shipping),
          useValue: mockRepository,
        },
        {
          provide: DjangoService,
          useValue: mockDjangoService,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: RouteStep,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    repository = module.get<Repository<Shipping>>(getRepositoryToken(Shipping));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
});
