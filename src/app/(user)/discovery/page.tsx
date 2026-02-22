/**
 * Discovery page
 * Browse potential matches with swipe-like interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { toast } from 'sonner';
import ProfileCard, { ProfileData } from '@/components/ProfileCard';

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<ProfileData | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (actionLoading) return; // Disable keyboard shortcuts during loading
      if (e.key === 'ArrowLeft') {
        handlePass();
      } else if (e.key === 'ArrowRight') {
        handleLike();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, profiles, actionLoading]);

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
    if (currentIndex >= profiles.length || actionLoading) return;

    const profile = profiles[currentIndex];

    try {
      setActionLoading(true);

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedUserId: profile.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to like profile');
      }

      const data = await response.json();

      // Check if it's a match
      if (data.matched) {
        setMatchedProfile(profile);
        onOpen(); // Show match celebration modal
      }

      // Move to next profile after a brief delay
      setTimeout(
        () => {
          advanceToNext();
        },
        data.matched ? 0 : 200,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to like profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (currentIndex >= profiles.length || actionLoading) return;

    const profile = profiles[currentIndex];

    try {
      setActionLoading(true);

      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passedUserId: profile.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to pass profile');
      }

      // Move to next profile
      setTimeout(() => {
        advanceToNext();
      }, 200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pass profile');
    } finally {
      setActionLoading(false);
    }
  };

  const advanceToNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= profiles.length) {
      setNoMoreProfiles(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleMatchModalClose = () => {
    setMatchedProfile(null);
    onClose();
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
              {profiles.length === 0 ? "We couldn't find any matches for you at the moment. Check back later!" : "You've seen all available profiles. Check back later for more!"}
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
        <p className="text-sm text-gray-500 mt-2">Use arrow keys: ← Pass | → Like</p>
      </div>

      {/* Profile Card */}
      <div className="flex justify-center">
        <ProfileCard profile={currentProfile} onLike={handleLike} onPass={handlePass} showActions actionsDisabled={actionLoading} />
      </div>

      {/* Match Celebration Modal */}
      <Modal isOpen={isOpen} onClose={handleMatchModalClose} size="md" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">It&apos;s a Match!</h2>
          </ModalHeader>
          <ModalBody className="text-center pb-6">
            {matchedProfile && (
              <>
                <p className="text-lg mb-2">
                  You and <span className="font-semibold">{matchedProfile.name}</span> liked each other!
                </p>
                <p className="text-gray-600 text-sm">Start a conversation now and get to know each other better.</p>
              </>
            )}
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="primary" onPress={handleMatchModalClose} size="lg" className="px-8">
              Continue Browsing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
