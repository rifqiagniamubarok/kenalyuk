/**
 * Likes page
 * Display list of sent likes with match status
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Image, Button, Skeleton, Chip, Divider } from '@nextui-org/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface LikedUser {
  id: string;
  name: string;
  age: number;
  city: string;
  region: string;
  photos: string[];
}

interface SentLike {
  likeId: string;
  likedAt: string;
  matched: boolean;
  user: LikedUser;
}

export default function LikesPage() {
  const [likes, setLikes] = useState<SentLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/likes/sent');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch likes');
      }

      const data = await response.json();
      setLikes(data.likes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load likes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Likes</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardBody className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/2 h-4 rounded-lg" />
                    <Skeleton className="w-1/3 h-4 rounded-lg" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Likes</h1>
        <Card className="border-danger">
          <CardBody>
            <p className="text-danger">{error}</p>
            <Button
              color="primary"
              size="sm"
              onPress={fetchLikes}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Likes</h1>
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-xl font-semibold mb-2">No likes sent yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring profiles to find people you like!
            </p>
            <Link href="/discovery">
              <Button color="primary" size="lg">
                Discover Profiles
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const matchedCount = likes.filter((like) => like.matched).length;
  const pendingCount = likes.length - matchedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Your Likes</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">{matchedCount} Matched</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{pendingCount} Pending</span>
        </div>
      </div>

      <div className="space-y-4">
        {likes.map((like) => {
          const photoUrl = like.user.photos[0] || '/placeholder-avatar.png';
          
          return (
            <Card key={like.likeId} className="w-full hover:shadow-md transition-shadow">
              <CardBody className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={photoUrl}
                      alt={like.user.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold truncate">
                          {like.user.name}, {like.user.age}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {like.user.city}, {like.user.region}
                        </p>
                      </div>
                      
                      <Chip
                        color={like.matched ? 'success' : 'default'}
                        variant="flat"
                        size="sm"
                      >
                        {like.matched ? '✓ Matched' : '⏳ Pending'}
                      </Chip>
                    </div>

                    <Divider className="my-3" />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-500">
                        Liked {new Date(like.likedAt).toLocaleDateString()}
                      </span>
                      
                      {like.matched && (
                        <Link href="/matches">
                          <Button color="primary" size="sm" variant="flat">
                            View Matches
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
