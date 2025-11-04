import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from 'src/common/services/redis.service';
import { DjangoService } from 'src/common/services/django.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipping]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ShippingController],
  providers: [ShippingService, JwtAuthGuard, RedisService, DjangoService],
  exports: [ShippingService],
})
export class ShippingModule {}
