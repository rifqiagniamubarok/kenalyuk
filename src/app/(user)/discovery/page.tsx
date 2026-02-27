/**
 * Discovery page
 * Browse potential matches with swipe-like interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip } from '@nextui-org/react';
import { toast } from 'sonner';
import ProfileCard, { ProfileData } from '@/components/ProfileCard';

const SWIPE_ANIMATION_MS = 280;

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<ProfileData | null>(null);
  const [detailProfile, setDetailProfile] = useState<ProfileData | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

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

      runSwipeAnimationAndAdvance('right', () => {
        if (data.matched) {
          setMatchedProfile(profile);
          onOpen();
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to like profile');
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

      runSwipeAnimationAndAdvance('left');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pass profile');
      setActionLoading(false);
    }
  };

  const runSwipeAnimationAndAdvance = (direction: 'left' | 'right', onSwipeStart?: () => void) => {
    setSwipeDirection(direction);
    onSwipeStart?.();

    window.setTimeout(() => {
      advanceToNext();
      setSwipeDirection(null);
      setActionLoading(false);
    }, SWIPE_ANIMATION_MS);
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

  const handleOpenDetail = () => {
    if (currentIndex >= profiles.length) return;
    setDetailProfile(profiles[currentIndex]);
    onDetailOpen();
  };

  const handleDetailModalClose = () => {
    setDetailProfile(null);
    onDetailClose();
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
      </div>

      {/* Profile Card */}
      <div className="flex justify-center">
        <ProfileCard profile={currentProfile} onOpenDetail={handleOpenDetail} showActions={false} swipeDirection={swipeDirection} />
      </div>

      {/* Action Card */}
      <div className="flex justify-center mt-4">
        <Card className="w-full max-w-[400px]">
          <CardBody className="py-4">
            <div className="flex items-center justify-center gap-4">
              <Tooltip content="Pass" placement="top">
                <Button isIconOnly size="lg" variant="flat" onPress={handlePass} isDisabled={actionLoading} className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-600">
                  <span className="text-2xl">✕</span>
                </Button>
              </Tooltip>
              <Tooltip content="Like" placement="top">
                <Button
                  isIconOnly
                  size="lg"
                  color="success"
                  variant="flat"
                  onPress={handleLike}
                  isDisabled={actionLoading}
                  className="w-14 h-14 bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <span className="text-2xl">♥</span>
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Match Celebration Modal */}
      <Modal isOpen={isOpen} onClose={handleMatchModalClose} size="md" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-primary">It&apos;s a Match!</h2>
          </ModalHeader>
          <ModalBody className="text-center pb-6">
            {matchedProfile && (
              <>
                <p className="text-lg mb-2">
                  You and <span className="font-semibold">{matchedProfile.name}</span> liked each other!
                </p>
                <p className="text-text-secondary text-sm">Start a conversation now and get to know each other better.</p>
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

      <Modal isOpen={isDetailOpen} onClose={handleDetailModalClose} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          <ModalHeader className="text-xl font-semibold">Profile Detail</ModalHeader>
          <ModalBody>
            {detailProfile && (
              <div className="space-y-5">
                <div className="rounded-lg overflow-hidden bg-gray-100">
                  <img src={detailProfile.photos[0] || '/placeholder-avatar.png'} alt={`${detailProfile.name} main photo`} className="w-full h-auto object-cover" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold">
                    {detailProfile.name}, {detailProfile.age}
                  </h3>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-default-600 mb-1">About</h4>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{detailProfile.about || 'No about information yet.'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-default-600 mb-2">Biodata</h4>
                  <div className="space-y-1 text-sm text-default-700">
                    <p>
                      <span className="font-medium">Age:</span> {detailProfile.age}
                    </p>
                    <p>
                      <span className="font-medium">City:</span> {detailProfile.city}
                    </p>
                    <p>
                      <span className="font-medium">Region:</span> {detailProfile.region}
                    </p>
                    <p>
                      <span className="font-medium">Height:</span> {detailProfile.height ? `${detailProfile.height} cm` : '-'}
                    </p>
                    <p>
                      <span className="font-medium">Education:</span> {detailProfile.education || '-'}
                    </p>
                    <p>
                      <span className="font-medium">Occupation:</span> {detailProfile.occupation || '-'}
                    </p>
                    <p>
                      <span className="font-medium">Religion Level:</span> {detailProfile.religionLevel || '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-default-600 mb-2">Other Photos</h4>
                  {detailProfile.photos.slice(1).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {detailProfile.photos.slice(1).map((photo, index) => (
                        <div key={photo} className="rounded-md overflow-hidden bg-gray-100">
                          <img src={photo} alt={`${detailProfile.name} photo ${index + 2}`} className="w-full h-32 object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">No additional photos.</p>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleDetailModalClose} className="w-full">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
