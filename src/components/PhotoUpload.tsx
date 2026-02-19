'use client';

/**
 * Multi-photo upload component with client-side compression
 * Supports 5-9 photos with drag-and-drop and preview
 */

import { useState, useRef } from 'react';
import { compressImage, validateImageFile, createImagePreview } from '@/lib/image';

interface PhotoUploadProps {
  onUploadComplete?: (photoUrls: string[]) => void;
  initialPhotos?: string[];
}

interface PhotoPreview {
  id: string;
  file?: File;
  url: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function PhotoUpload({ onUploadComplete, initialPhotos = [] }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>(
    initialPhotos.map((url, index) => ({
      id: `existing-${index}`,
      url,
      uploading: false,
      uploaded: true,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError('');

    // Check if adding these files would exceed the maximum
    const remainingSlots = 9 - photos.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photo(s)`);
      return;
    }

    // Process each file
    const newPhotos: PhotoPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Create preview
      try {
        const previewUrl = await createImagePreview(file);
        newPhotos.push({
          id: `new-${Date.now()}-${i}`,
          file,
          url: previewUrl,
          uploading: false,
          uploaded: false,
        });
      } catch (err) {
        console.error('Failed to create preview:', err);
      }
    }

    setPhotos([...photos, ...newPhotos]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleUploadAll = async () => {
    if (photos.length < 5) {
      setError('Please upload at least 5 photos');
      return;
    }

    setError('');

    // Get photos that need to be uploaded
    const photosToUpload = photos.filter((p) => !p.uploaded && p.file);

    if (photosToUpload.length === 0) {
      // All photos already uploaded
      const photoUrls = photos.map((p) => p.url);
      onUploadComplete?.(photoUrls);
      return;
    }

    // Upload each photo
    const uploadPromises = photosToUpload.map(async (photo) => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, uploading: true } : p))
      );

      try {
        // Compress image before upload
        const compressedFile = await compressImage(photo.file!);

        // Upload to server
        const formData = new FormData();
        formData.append('file', compressedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Upload failed');
        }

        const data = await res.json();

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, url: data.url, uploading: false, uploaded: true }
              : p
          )
        );

        return data.url;
      } catch (err) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, uploading: false, error: 'Upload failed' }
              : p
          )
        );
        throw err;
      }
    });

    try {
      await Promise.all(uploadPromises);

      // Get all photo URLs
      const photoUrls = photos.map((p) => {
        const uploaded = photosToUpload.find((u) => u.id === p.id);
        return uploaded ? uploaded.url : p.url;
      });

      onUploadComplete?.(photoUrls);
    } catch (err) {
      setError('Some photos failed to upload. Please try again.');
    }
  };

  const canUploadMore = photos.length < 9;
  const hasMinimumPhotos = photos.length >= 5;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Upload area */}
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-pink-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG or JPEG only, up to 10MB per file
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Upload 5-9 photos ({photos.length}/9 uploaded)
          </p>
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload status */}
              {photo.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}

              {photo.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-white text-xs text-center px-2">{photo.error}</div>
                </div>
              )}

              {photo.uploaded && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Photo number */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requirements info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Photo Requirements</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Upload 5-9 recent photos of yourself</li>
          <li>Photos will be compressed automatically for faster loading</li>
          <li>Clear, well-lit photos work best</li>
          <li>At least one photo should show your face clearly</li>
          <li>Follow Islamic standards of modesty</li>
        </ul>
      </div>

      {/* Upload button */}
      {photos.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasMinimumPhotos ? (
              <span className="text-green-600">✓ Minimum photos uploaded</span>
            ) : (
              <span className="text-orange-600">
                Upload at least {5 - photos.length} more photo(s)
              </span>
            )}
          </div>
          <button
            onClick={handleUploadAll}
            disabled={!hasMinimumPhotos || photos.some((p) => p.uploading)}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {photos.some((p) => p.uploading) ? 'Uploading...' : 'Save Photos'}
          </button>
        </div>
      )}
    </div>
  );
}
