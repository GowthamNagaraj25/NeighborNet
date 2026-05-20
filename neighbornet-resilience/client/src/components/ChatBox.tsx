import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageThread, User } from '../types';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { joinThread, leaveThread } from '../services/socket';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
  thread: MessageThread;
}

export default function ChatBox({ thread }: Props) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherParticipant = thread.participants.find((p) => p._id !== user?._id);

  useEffect(() => {
    loadMessages();
    joinThread(thread._id);
    return () => leaveThread(thread._id);
  }, [thread._id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { threadId: string; message: Message }) => {
      if (data.threadId === thread._id) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    };
    socket.on('receiveMessage', handler);
    return () => { socket.off('receiveMessage', handler); };
  }, [socket, thread._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await messagesAPI.getMessages(thread._id);
      setMessages(res.data.data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await messagesAPI.sendMessage(thread._id, text.trim());
      setText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-warm-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white font-bold">
            {otherParticipant?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{otherParticipant?.name || 'Chat'}</p>
            <p className="text-xs text-gray-500">{otherParticipant?.neighborhood}</p>
          </div>
        </div>
        {thread.post && (
          <div className="mt-2 text-xs text-gray-500 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
            Re: {(thread.post as any).title}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">💬</p>
            <p>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = typeof msg.sender === 'string' ? msg.sender : (msg.sender as User)._id;
            const isMe = senderId === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isMe && (
                    <span className="text-xs text-gray-400 ml-1">{(msg.sender as User).name}</span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400">
                    {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {sending ? '...' : '→'}
          </button>
        </div>
      </form>
    </div>
  );
}
