/**
 * Photo upload page
 * Allows users to upload 5-9 photos for their profile
 */

'use client';

import { useRouter } from 'next/navigation';
import PhotoUpload from '@/components/PhotoUpload';
import { useState, useEffect } from 'react';

export default function PhotosPage() {
  const router = useRouter();
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing photos
  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch('/api/biodata');
        if (res.ok) {
          const data = await res.json();
          if (data.biodata?.photoUrls) {
            setInitialPhotos(data.biodata.photoUrls);
          }
        }
      } catch (err) {
        console.error('Failed to load photos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  const handleUploadComplete = async (photoUrls: string[]) => {
    try {
      // Save photos to user profile
      const res = await fetch('/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save photos');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to save photos');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photos</h1>
        <p className="text-gray-600">Upload 5-9 recent photos of yourself. Your photos will be reviewed by a supervisor before you can start using the platform.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <PhotoUpload onUploadComplete={handleUploadComplete} initialPhotos={initialPhotos} />
      </div>
    </div>
  );
}
