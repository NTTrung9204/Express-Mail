import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { FileService } from './file.service';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';

@ApiTags('File')
@Controller('uploads')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @RequirePermission(PermissionEnum.CAN_CREATE_ORDER)
  @Get(':filename')
  @ApiParam({
    name: 'filename',
    type: 'string',
    example: 'e0d5ee4b-4440-43c2-9ba4-ced1b5d8e172-1763361263830.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  getFile(@Param('filename') filename: string, @Res() res: Response): void {
    const { path, mimetype } = this.fileService.getFile(filename);
    res.type(mimetype);
    res.sendFile(path);
  }
}
