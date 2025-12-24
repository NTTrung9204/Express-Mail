import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Product Upload')
@Controller('product')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: '/uploads/file-uuid-timestamp.jpg' },
      },
    },
  })
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ): ApiResponseDto<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const url = this.fileUploadService.saveFile(file);
    return new ApiResponseDto(
      true,
      'Product image uploaded successfully',
      { url },
      undefined,
      201,
    );
  }

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '/uploads/file1-uuid-timestamp.jpg',
            '/uploads/file2-uuid-timestamp.jpg',
          ],
        },
      },
    },
  })
  uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): ApiResponseDto<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const urls = this.fileUploadService.saveFiles(files);
    return new ApiResponseDto(
      true,
      'Product images uploaded successfully',
      { urls },
      undefined,
      201,
    );
  }
}
