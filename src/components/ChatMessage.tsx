/**
 * ChatMessage component
 * Displays a single message bubble in the chat
 */

import { Card, CardBody } from '@nextui-org/react';
import { Message } from '@/lib/useChat';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

/**
 * Message bubble component
 * @param message - The message object
 * @param isOwn - Whether the message was sent by the current user
 */
export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && <span className="text-xs text-gray-500 mb-1 px-2">{message.sender.name}</span>}
        <Card className={`${isOwn ? 'bg-primary text-primary-foreground' : 'bg-default-100 text-default-foreground'}`}>
          <CardBody className="px-4 py-2">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <span className={`text-xs mt-1 block ${isOwn ? 'opacity-80' : 'text-gray-500'}`}>{formattedTime}</span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
