import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { FileService } from './file.service';

@ApiTags('File')
@Controller('uploads')
export class FileController {
  constructor(private readonly fileService: FileService) {}

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
