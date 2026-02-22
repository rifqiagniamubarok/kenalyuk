'use client';

/**
 * ConversationMonitor component
 * Displays conversation card for supervisor review with close functionality
 */

import { useState } from 'react';
import Image from 'next/image';

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

interface ConversationMonitorProps {
  conversation: Conversation;
  onClose: (matchId: string, reason: string) => void;
  onView: (matchId: string) => void;
}

export default function ConversationMonitor({ conversation, onClose, onView }: ConversationMonitorProps) {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (closeReason.length < 10) {
      alert('Closure reason must be at least 10 characters');
      return;
    }
    setLoading(true);
    await onClose(conversation.matchId, closeReason);
    setLoading(false);
    setShowCloseModal(false);
    setCloseReason('');
  };

  const isClosed = conversation.status === 'CLOSED';

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isClosed ? 'opacity-75' : ''}`}>
        <div className="p-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                isClosed ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {isClosed ? '🔒 Closed' : '✅ Active'}
            </span>
            <span className="text-sm text-gray-500">
              {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Users */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 flex-1">
              {conversation.user1.photoUrls[0] && (
                <Image
                  src={conversation.user1.photoUrls[0]}
                  alt={conversation.user1.name || 'User 1'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{conversation.user1.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {conversation.user1.city}, {conversation.user1.region?.name}
                </p>
              </div>
            </div>

            <span className="text-gray-400">💬</span>

            <div className="flex items-center gap-2 flex-1">
              {conversation.user2.photoUrls[0] && (
                <Image
                  src={conversation.user2.photoUrls[0]}
                  alt={conversation.user2.name || 'User 2'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{conversation.user2.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {conversation.user2.city}, {conversation.user2.region?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Last Message */}
          {conversation.lastMessage && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
              <p className="text-gray-700 truncate">{conversation.lastMessage.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(conversation.lastMessage.createdAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Closure Info */}
          {isClosed && conversation.closedReason && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-semibold text-red-700">Closure Reason:</p>
              <p className="text-red-600">{conversation.closedReason}</p>
              <p className="text-xs text-red-500 mt-1">
                Closed {new Date(conversation.closedAt!).toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(conversation.matchId)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            >
              📖 View Messages
            </button>
            {!isClosed && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                🔒 Close Conversation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Close Conversation</h2>
            <p className="text-gray-600 mb-4">
              You are about to close the conversation between {conversation.user1.name} and{' '}              {conversation.user2.name}. This action cannot be undone and will prevent further messaging.
            </p>
            <label className="block mb-4">
              <span className="text-sm font-semibold mb-1 block">Reason for Closure (min 10 characters):</span>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="E.g., Inappropriate content, user report, policy violation..."
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCloseModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={loading || closeReason.length < 10}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
              >
                {loading ? 'Closing...' : 'Confirm Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
