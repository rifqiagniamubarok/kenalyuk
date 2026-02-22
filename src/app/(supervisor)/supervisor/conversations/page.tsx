'use client';

/**
 * Supervisor Conversations Page
 * Displays all conversations in supervisor's region with monitoring capabilities
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConversationMonitor from '@/components/ConversationMonitor';

interface Region {
  id: string;
  name: string;
}

interface ConversationUser {
  id: string;
  name: string | null;
  photoUrls: string[];
  city: string | null;
  region: Region | null;
}

interface LastMessage {
  content: string;
  createdAt: string;
}

interface Conversation {
  matchId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  closedReason: string | null;
  user1: ConversationUser;
  user2: ConversationUser;
  messageCount: number;
  lastMessage: LastMessage | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    photoUrls: string[];
  };
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingMatch, setViewingMatch] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supervisor/conversations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch conversations');
      }

      setConversations(data.conversations);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/supervisor/conversations/${matchId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages);
      setViewingMatch(matchId);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleClose = async (matchId: string, reason: string) => {
    try {
      const response = await fetch(`/api/supervisor/conversations/${matchId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close conversation');
      }

      alert('Conversation closed successfully!');
      fetchConversations(); // Refresh list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Conversation Monitoring</h1>
        <div className="text-center py-12">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Conversation Monitoring</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
          <button onClick={fetchConversations} className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeCount = conversations.filter((c) => c.status === 'ACTIVE').length;
  const closedCount = conversations.filter((c) => c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversation Monitoring</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-semibold">✅ {activeCount} Active</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">🔒 {closedCount} Closed</span>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-gray-600">No matches have started conversations in your region.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.map((conversation) => (
            <ConversationMonitor key={conversation.matchId} conversation={conversation} onClose={handleClose} onView={fetchMessages} />
          ))}
        </div>
      )}

      {/* Messages Modal */}
      {viewingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Message History</h2>
              <button onClick={() => setViewingMatch(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="text-center py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No messages yet</div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold">{message.sender.name}</span>
                        <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
