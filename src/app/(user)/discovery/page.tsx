/**
 * Discovery page
 * Browse potential matches with swipe-like interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Button, Progress } from '@nextui-org/react';
import ProfileCard, { ProfileData } from '@/components/ProfileCard';

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePass();
      } else if (e.key === 'ArrowRight') {
        handleLike();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/discovery');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data.profiles);
      setCurrentIndex(0);

      if (data.profiles.length === 0) {
        setNoMoreProfiles(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    // TODO: Call like API endpoint (will be implemented in 02-03)
    console.log('Liked:', profile.id);

    // Move to next profile
    advanceToNext();
  };

  const handlePass = async () => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    // TODO: Call pass API endpoint (will be implemented in 02-03)
    console.log('Passed:', profile.id);

    // Move to next profile
    advanceToNext();
  };

  const advanceToNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= profiles.length) {
      setNoMoreProfiles(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600">Finding profiles for you...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center py-8 px-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button color="primary" onPress={fetchProfiles}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Empty/No more profiles state
  if (noMoreProfiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center py-8 px-6">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">No profiles available</h2>
            <p className="text-gray-600 mb-4">
              {profiles.length === 0
                ? "We couldn't find any matches for you at the moment. Check back later!"
                : "You've seen all available profiles. Check back later for more!"}
            </p>
            <Button color="primary" onPress={fetchProfiles}>
              Refresh
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const progress = ((currentIndex + 1) / profiles.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" size="sm" />
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {profiles.length}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Use arrow keys: ← Pass | → Like
        </p>
      </div>

      {/* Profile Card */}
      <div className="flex justify-center">
        <ProfileCard profile={currentProfile} onLike={handleLike} onPass={handlePass} showActions />
      </div>
    </div>
  );
}
