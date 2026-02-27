'use client';

import { useEffect, useState } from 'react';
import PhotoUpload from '@/components/PhotoUpload';

export default function ProfilePhotoSection() {
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch('/api/biodata');
        if (res.ok) {
          const data = await res.json();
          setInitialPhotos(data.biodata?.photoUrls || []);
        }
      } catch (err) {
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    }

    loadPhotos();
  }, []);

  const handleUploadComplete = async (photoUrls: string[]) => {
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to save photos' }));
        throw new Error(data.error || 'Failed to save photos');
      }

      setInitialPhotos(photoUrls);
      setSuccessMessage('Photos saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save photos');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-600">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{successMessage}</div>}

      <PhotoUpload onUploadComplete={handleUploadComplete} initialPhotos={initialPhotos} />
    </div>
  );
}
