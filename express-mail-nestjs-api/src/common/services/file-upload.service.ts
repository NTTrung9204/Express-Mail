import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
  ];

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of 5MB`,
      );
    }

    // Validate mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    try {
      const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(this.uploadDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      // Return relative path to file
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new BadRequestException('Failed to save file');
    }
  }

  saveFiles(files: Express.Multer.File[]): string[] {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      const filePaths = files.map((file) => this.saveFile(file));
      return filePaths;
    } catch (error) {
      console.error('Error saving files:', error);
      throw error;
    }
  }

  deleteFile(filepath: string): void {
    try {
      if (!filepath) return;

      // Extract filename from path
      const filename = filepath.split('/').pop();
      if (!filename) return;

      const fullPath = path.join(this.uploadDir, filename);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - just log the error
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
