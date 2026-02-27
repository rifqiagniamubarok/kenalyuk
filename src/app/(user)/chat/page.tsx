'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, Card, CardBody, Chip, Skeleton } from '@nextui-org/react';
import { toast } from 'sonner';

interface MatchUser {
  name: string;
  photos: string[];
}

interface LastMessage {
  content: string;
}

interface ChatMatch {
  matchId: string;
  user: MatchUser;
  unreadCount: number;
  hasNoMessages: boolean;
  lastMessage: LastMessage | null;
}

export default function ChatPage() {
  const [matches, setMatches] = useState<ChatMatch[]>([]);
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
        throw new Error(data.error || 'Failed to fetch chats');
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch chats';
      setError(message);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">Chats</h1>
        {[1, 2, 3].map((row) => (
          <Card key={row} className="shadow-soft">
            <CardBody className="flex flex-row items-center gap-3 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-4 w-48 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">Chats</h1>
        <Card className="border-red-200 shadow-soft">
          <CardBody className="p-4">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchMatches} className="mt-3 text-sm font-medium text-primary hover:text-primary-dark">
              Try again
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">Chats</h1>
        <Card className="shadow-soft">
          <CardBody className="p-6 text-center">
            <p className="text-text-secondary">No chats yet. Match with someone to start chatting.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-text-primary">Chats</h1>

      <div className="space-y-3">
        {matches.map((match) => {
          const avatarSrc = match.user.photos[0] || '/placeholder-avatar.png';
          const preview = match.lastMessage?.content || 'New match - start chatting';

          return (
            <Link key={match.matchId} href={`/chat/${match.matchId}`} className="block">
              <Card className="shadow-soft transition-shadow hover:shadow-medium">
                <CardBody className="flex flex-row items-center gap-3 p-4">
                  <Avatar src={avatarSrc} name={match.user.name} size="md" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary">{match.user.name}</p>
                    <p className="truncate text-sm text-text-secondary">{preview}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {match.hasNoMessages && (
                      <Chip color="primary" size="sm" variant="flat">
                        New
                      </Chip>
                    )}
                    {match.unreadCount > 0 && (
                      <Chip color="danger" size="sm" variant="solid">
                        {match.unreadCount}
                      </Chip>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
