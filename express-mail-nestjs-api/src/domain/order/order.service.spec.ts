import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from '../product/product.service';
import { Order } from './entities/order.entity';
import { OrderTransition } from './entities/order-transition.entity';
import { OrderPostOffice } from './entities/post-office-order.entity';
import { Shipping } from '../shipping/entities/shipping.entity';
import { DjangoService } from 'src/common/services/django.service';
import { FileUploadService } from 'src/common/services/file-upload.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {},
        },
        {
          provide: getRepositoryToken(OrderTransition),
          useValue: {},
        },
        {
          provide: getRepositoryToken(OrderPostOffice),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shipping),
          useValue: {},
        },
        {
          provide: ProductService,
          useValue: {},
        },
        {
          provide: DjangoService,
          useValue: {},
        },
        {
          provide: FileUploadService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
