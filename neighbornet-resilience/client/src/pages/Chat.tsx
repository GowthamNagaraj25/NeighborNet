import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import { MessageThread, User } from '../types';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Chat() {
  const { threadId } = useParams<{ threadId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const t = threads.find((th) => th._id === threadId);
      if (t) setActiveThread(t);
    }
  }, [threadId, threads]);

  const loadThreads = async () => {
    try {
      const res = await messagesAPI.getThreads();
      setThreads(res.data.data);
      if (threadId) {
        const t = res.data.data.find((th: MessageThread) => th._id === threadId);
        if (t) setActiveThread(t);
      } else if (res.data.data.length > 0 && !threadId) {
        setActiveThread(res.data.data[0]);
        navigate(`/chat/${res.data.data[0]._id}`, { replace: true });
      }
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const selectThread = (thread: MessageThread) => {
    setActiveThread(thread);
    navigate(`/chat/${thread._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">💬 Messages</h1>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Thread list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />)}
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-12 text-gray-400 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Start a chat from a post or AI match.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const other = thread.participants.find((p) => p._id !== user?._id);
                const isActive = activeThread?._id === thread._id;
                return (
                  <button
                    key={thread._id}
                    onClick={() => selectThread(thread)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {other?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-900 truncate">{other?.name || 'Unknown'}</p>
                          {thread.lastMessageAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                              {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        {thread.post && (
                          <p className="text-xs text-primary-600 truncate">Re: {(thread.post as any).title}</p>
                        )}
                        {thread.lastMessage && (
                          <p className="text-xs text-gray-400 truncate">{thread.lastMessage}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2">
          {activeThread ? (
            <ChatBox thread={activeThread} />
          ) : (
            <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Or start a new chat from a post</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
