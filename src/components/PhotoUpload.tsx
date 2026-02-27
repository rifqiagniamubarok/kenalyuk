'use client';

/**
 * Multi-photo upload component with client-side compression
 * Supports exactly 5 photos with drag-and-drop and preview
 */

import { useMemo, useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { compressImage, validateImageFile, createImagePreview } from '@/lib/image';

const REQUIRED_PHOTO_COUNT = 5;

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

interface SortablePhotoProps {
  photo: PhotoPreview;
  index: number;
  onRemove: (id: string) => void;
}

function SortablePhoto({ photo, index, onRemove }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? 'z-20 opacity-70' : ''}`}>
      <div
        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === 0 ? 'border-primary ring-1 ring-primary/30' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
      </div>

      {photo.uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-white text-sm">Uploading...</div>
        </div>
      )}

      {photo.error && (
        <div className="absolute inset-0 bg-red-500/75 flex items-center justify-center rounded-lg">
          <div className="text-white text-xs text-center px-2">{photo.error}</div>
        </div>
      )}

      {photo.uploaded && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove photo ${index + 1}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <button
        type="button"
        className="absolute bottom-2 right-2 bg-black/60 text-white rounded p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Drag to reorder photo ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 15h8" />
        </svg>
      </button>

      <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded ${index === 0 ? 'bg-primary' : 'bg-black/50'}`}>
        {index === 0 ? 'Profile Picture' : `#${index + 1}`}
      </div>
    </div>
  );
}

export default function PhotoUpload({ onUploadComplete, initialPhotos = [] }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>(
    initialPhotos.map((url, index) => ({
      id: `existing-${index}`,
      url,
      uploading: false,
      uploaded: true,
    })),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const photoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);

  const activePhoto = activeId ? photos.find((photo) => photo.id === activeId) : null;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError('');

    // Check if adding these files would exceed the maximum
    const remainingSlots = REQUIRED_PHOTO_COUNT - photos.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photo(s) (max ${REQUIRED_PHOTO_COUNT})`);
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

  const persistPhotoOrder = async (orderedPhotoUrls: string[]) => {
    const res = await fetch('/api/upload/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrls: orderedPhotoUrls }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Failed to reorder photos' }));
      throw new Error(data.error || 'Failed to reorder photos');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setError('');

    const previousPhotos = [...photos];
    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
    setPhotos(reorderedPhotos);

    const allUploaded = reorderedPhotos.length > 0 && reorderedPhotos.every((photo) => photo.uploaded);

    if (!allUploaded) {
      return;
    }

    try {
      await persistPhotoOrder(reorderedPhotos.map((photo) => photo.url));
    } catch (err) {
      setPhotos(previousPhotos);
      setError(err instanceof Error ? err.message : 'Failed to reorder photos');
    }
  };

  const handleUploadAll = async () => {
    if (photos.length !== REQUIRED_PHOTO_COUNT) {
      setError(`Please upload exactly ${REQUIRED_PHOTO_COUNT} photos`);
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
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, uploading: true } : p)));

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

        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, url: data.url, uploading: false, uploaded: true } : p)));

        return data.url;
      } catch (err) {
        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, uploading: false, error: 'Upload failed' } : p)));
        throw err;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const uploadedUrlMap = new Map(photosToUpload.map((photo, index) => [photo.id, uploadedUrls[index]]));
      const photoUrls = photos.map((photo) => uploadedUrlMap.get(photo.id) || photo.url);

      onUploadComplete?.(photoUrls);
    } catch (err) {
      setError('Some photos failed to upload. Please try again.');
    }
  };

  const canUploadMore = photos.length < REQUIRED_PHOTO_COUNT;
  const hasRequiredPhotos = photos.length === REQUIRED_PHOTO_COUNT;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Upload area */}
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />

          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-2 text-sm text-text-secondary">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-text-secondary mt-1">PNG or JPEG only, up to 10MB per file</p>
          <p className="text-xs text-text-secondary mt-1">
            Upload exactly 5 photos ({photos.length}/{REQUIRED_PHOTO_COUNT} uploaded)
          </p>
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(String(event.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={photoIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <SortablePhoto key={photo.id} photo={photo} index={index} onRemove={handleRemovePhoto} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activePhoto ? (
              <div className="relative aspect-square w-36 rounded-lg overflow-hidden border-2 border-primary shadow-soft opacity-90">
                <img src={activePhoto.url} alt="Dragging photo" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Requirements info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Photo Requirements</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Upload exactly 5 recent photos of yourself (maximum 5)</li>
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
            {photos.length > REQUIRED_PHOTO_COUNT ? (
              <span className="text-red-600">
                Remove {photos.length - REQUIRED_PHOTO_COUNT} photo(s) to continue (max {REQUIRED_PHOTO_COUNT})
              </span>
            ) : hasRequiredPhotos ? (
              <span className="text-green-600">✓ Required photos uploaded</span>
            ) : (
              <span className="text-orange-600">Upload {REQUIRED_PHOTO_COUNT - photos.length} more photo(s)</span>
            )}
          </div>
          <button
            onClick={handleUploadAll}
            disabled={!hasRequiredPhotos || photos.some((p) => p.uploading)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-soft"
          >
            {photos.some((p) => p.uploading) ? 'Uploading...' : 'Save Photos'}
          </button>
        </div>
      )}
    </div>
  );
}
