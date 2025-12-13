import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'uploads',
  );

  getFile(filename: string): { path: string; mimetype: string } {
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new NotFoundException('Invalid filename');
    }

    const filePath = path.join(this.uploadDir, filename);
    console.log('Resolved file path:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    const ext = path.extname(filename).toLowerCase();
    const mimetypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };

    const mimetype = mimetypeMap[ext] || 'application/octet-stream';

    return { path: filePath, mimetype };
  }
}
