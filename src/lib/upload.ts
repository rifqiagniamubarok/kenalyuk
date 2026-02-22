/**
 * File upload utilities for server-side handling
 * Manages photo storage on filesystem
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

/**
 * Get upload directory path from environment or use default
 */
export function getUploadDirectory(): string {
  return process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), 'public', 'uploads');
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDirectory(): Promise<void> {
  const uploadDir = getUploadDirectory();
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
}

/**
 * Generate unique filename with extension
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const randomName = randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
}

/**
 * Save uploaded file to disk
 * @param file File buffer
 * @param filename Target filename
 * @returns Public URL path to the file
 */
export async function saveUploadedFile(file: Buffer, filename: string): Promise<string> {
  await ensureUploadDirectory();

  const uploadDir = getUploadDirectory();
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, file);

  // Return public URL path
  return `/uploads/${filename}`;
}

/**
 * Validate file buffer
 */
export function validateFileBuffer(buffer: Buffer, maxSizeMB: number = 10): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (buffer.length > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
}
