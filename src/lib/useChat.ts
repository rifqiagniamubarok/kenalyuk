/**
 * useChat custom hook
 * Manages chat state, message history, SSE connection, and sending messages
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MessageSender {
  id: string;
  name: string;
  photoUrls: string[];
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (typing: boolean) => void;
}

/**
 * Custom hook for managing chat functionality
 * @param matchId - The match ID for the chat room
 * @returns Chat state and actions
 */
export function useChat(matchId: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch message history on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/messages/${matchId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [matchId]);

  // Establish SSE connection for real-time updates
  useEffect(() => {
    // Skip SSE connection during initial load
    if (loading) return;

    const eventSource = new EventSource('/api/socket');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'message' && data.matchId === matchId) {
          // Add new message to the list
          setMessages((prevMessages) => {
            // Avoid duplicates
            const exists = prevMessages.some((msg) => msg.id === data.message.id);
            if (exists) return prevMessages;
            return [...prevMessages, data.message];
          });
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [matchId, loading]);

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, content }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send message');
        }

        const data = await response.json();

        // Add message to local state immediately (optimistic update)
        setMessages((prevMessages) => {
          // Check if message already exists (from SSE)
          const exists = prevMessages.some((msg) => msg.id === data.message.id);
          if (exists) return prevMessages;
          return [...prevMessages, data.message];
        });
      } catch (err) {
        throw err; // Let the component handle the error
      }
    },
    [matchId],
  );

  // Typing indicator function (placeholder for future implementation)
  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    // TODO: Send typing indicator to server in future enhancement
  }, []);

  return {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    setTyping,
  };
}
