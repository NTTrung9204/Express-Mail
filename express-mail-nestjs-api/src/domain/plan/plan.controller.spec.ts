import { Test, TestingModule } from '@nestjs/testing';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PermissionService } from 'src/common/services/permission.service';
import { WebhookService } from 'src/common/services/webhook.service';

describe('PlanController', () => {
  let controller: PlanController;
  let service: PlanService;

  const mockPlanService = {
    getPlans: jest.fn(),
    createPlan: jest.fn(),
    updatePlan: jest.fn(),
    deletePlan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        {
          provide: PlanService,
          useValue: mockPlanService,
        },
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
      ],
    }).compile();

    controller = module.get<PlanController>(PlanController);
    service = module.get<PlanService>(PlanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
