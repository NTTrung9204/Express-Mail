import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CommonModule } from 'src/common/module/common.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    CommonModule,
  ],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
