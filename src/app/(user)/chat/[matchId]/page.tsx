/**
 * Chat room page
 * Real-time chat interface for matched users
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Button, Skeleton, Divider, Spinner } from '@nextui-org/react';
import { toast } from 'sonner';
import { useChat } from '@/lib/useChat';
import ChatMessage from '@/components/ChatMessage';

export default function ChatRoomPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { messages, loading, error, sendMessage, isTyping, currentUserId } = useChat(matchId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const messageContent = inputValue.trim();
    setInputValue(''); // Clear input immediately
    setSending(true);

    try {
      await sendMessage(messageContent);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
      setInputValue(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="w-32 h-6 rounded-lg" />
          </CardHeader>
          <Divider />
          <CardBody className="h-[600px] flex flex-col">
            <div className="flex-1 space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={i % 2 === 0 ? 'flex justify-end' : 'flex justify-start'}>
                  <Skeleton className={`w-48 h-16 rounded-lg`} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-danger">
          <CardBody className="text-center py-12">
            <p className="text-danger text-lg mb-4">{error}</p>
            <Button color="primary" onPress={() => window.location.reload()}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Determine other user's name for header
  const otherUserName = messages.length > 0 ? messages.find((msg) => msg.senderId !== currentUserId)?.sender.name || 'Chat' : 'Chat';

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{otherUserName}</h1>
          {isTyping && (
            <span className="text-sm text-gray-500 italic flex items-center gap-2">
              <Spinner size="sm" />
              Typing...
            </span>
          )}
        </CardHeader>
        <Divider />

        {/* Messages container */}
        <CardBody className="p-0">
          <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-4 flex flex-col">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
                  <p className="text-gray-600">Send a message to break the ice!</p>
                </div>
              </div>
            )}

            {/* Messages list */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} isOwn={message.senderId === currentUserId} />
            ))}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          <Divider />

          {/* Message input */}
          <div className="p-4 bg-gray-50">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                classNames={{
                  input: 'text-base',
                  inputWrapper: 'bg-white',
                }}
                fullWidth
              />
              <Button color="primary" onPress={handleSendMessage} isLoading={sending} disabled={!inputValue.trim() || sending} className="min-w-24">
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
