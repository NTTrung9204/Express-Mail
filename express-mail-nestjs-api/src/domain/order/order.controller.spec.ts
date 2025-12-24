import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderTransition } from './entities/order-transition.entity';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { OrderPostOffice } from './entities/post-office-order.entity';
import { Shipping } from '../shipping/entities/shipping.entity';
import { JwtService } from '@nestjs/jwt';
import { DjangoService } from 'src/common/services/django.service';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { RouteStep } from '../plan/entities/route-step.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionService } from 'src/common/services/permission.service';
import { WebhookService } from 'src/common/services/webhook.service';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        ProductService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
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
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(OrderTransition), useValue: {} },
        { provide: getRepositoryToken(OrderPostOffice), useValue: {} },
        { provide: getRepositoryToken(Shipping), useValue: {} },
        { provide: getRepositoryToken(RouteStep), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: DjangoService, useValue: {} },
        { provide: FileUploadService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
