/**
 * Matches page
 * Display list of active matches with chat functionality
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Image, Button, Skeleton, Divider } from '@nextui-org/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface MatchUser {
  id: string;
  name: string;
  age: number;
  city: string;
  region: string;
  photos: string[];
}

interface Match {
  matchId: string;
  matchedAt: string;
  user: MatchUser;
  unreadCount?: number;
  hasNoMessages?: boolean;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/matches');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Your Matches</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full shadow-soft">
              <CardBody className="p-4">
                <Skeleton className="w-full h-48 rounded-lg mb-3" />
                <Skeleton className="w-3/4 h-4 rounded-lg mb-2" />
                <Skeleton className="w-1/2 h-4 rounded-lg" />
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
        <h1 className="text-3xl font-bold text-text-primary">Your Matches</h1>
        <Card className="border-red-200">
          <CardBody>
            <p className="text-red-600">{error}</p>
            <Button color="primary" size="sm" onPress={fetchMatches} className="mt-4 bg-primary hover:bg-primary-dark">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Your Matches</h1>
        <Card className="shadow-soft">
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">No matches yet</h2>
            <p className="text-text-secondary mb-6">Start discovering to find your perfect match!</p>
            <Link href="/discovery">
              <Button className="bg-primary hover:bg-primary-dark text-white" size="lg">
                Discover Profiles
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Your Matches</h1>
        <p className="text-text-secondary">
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => {
          const photoUrl = match.user.photos[0] || '/placeholder-avatar.png';

          return (
            <Card key={match.matchId} className="w-full shadow-soft hover:shadow-medium transition-shadow duration-200">
              <CardBody className="p-0">
                <div className="relative aspect-[3/4] bg-background-secondary rounded-t-lg overflow-hidden">
                  <Image
                    src={photoUrl}
                    alt={match.user.name}
                    className="w-full h-full object-cover"
                    classNames={{
                      wrapper: 'w-full h-full',
                      img: 'w-full h-full object-cover',
                    }}
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {match.user.name}, {match.user.age}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {match.user.city}, {match.user.region}
                    </p>
                  </div>

                  <Divider />

                  <div className="text-xs text-text-secondary">Matched {new Date(match.matchedAt).toLocaleDateString()}</div>

                  <p className="text-sm text-text-secondary">
                    {match.hasNoMessages
                      ? 'New match - start chatting'
                      : match.unreadCount && match.unreadCount > 0
                        ? `${match.unreadCount} unread message${match.unreadCount > 1 ? 's' : ''}`
                        : 'Open chat'}
                  </p>

                  <Link href={`/chat/${match.matchId}`} className="block">
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white" size="lg">
                      Open Chat
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
