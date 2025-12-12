import { Test, TestingModule } from '@nestjs/testing';
import { ShippingController } from './shipping.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { ShippingService } from './shipping.service';
import { JwtService } from '@nestjs/jwt';
import { PermissionService } from 'src/common/services/permission.service';
import { WebhookService } from 'src/common/services/webhook.service';

describe('ShippingController', () => {
  let controller: ShippingController;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };
    const mockShippingService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [
        {
          provide: ShippingService,
          useValue: mockShippingService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PermissionService,
          useValue: {
            checkPermission: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WebhookService,
          useValue: {
            sendWebhook: jest.fn(),
          },
        },
        JwtAuthGuard,
        {
          provide: getRepositoryToken(Shipping),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ShippingController>(ShippingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
