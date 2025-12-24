import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductUploadController } from './controllers/product-upload.controller';
import { CommonModule } from 'src/common/module/common.module';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    CommonModule,
  ],
  controllers: [ProductController, ProductUploadController],
  providers: [ProductService, FileUploadService],
  exports: [ProductService, FileUploadService],
})
export class ProductModule {}
