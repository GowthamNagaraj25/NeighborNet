import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AIMatch, Post, User } from '../types';
import BadgePill from './BadgePill';
import { messagesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  match: AIMatch;
  currentUserId?: string;
}

export default function MatchCard({ match, currentUserId }: Props) {
  const navigate = useNavigate();
  const isPost = match.type === 'post';
  const item = match.item as Post & User;

  const scoreColor =
    match.score >= 70 ? 'text-green-600 bg-green-50' :
    match.score >= 40 ? 'text-yellow-600 bg-yellow-50' :
    'text-gray-600 bg-gray-50';

  const handleStartChat = async () => {
    try {
      const participantId = isPost ? (item.author as User)?._id || item._id : item._id;
      if (participantId === currentUserId) {
        toast.error("You can't chat with yourself");
        return;
      }
      const res = await messagesAPI.createThread({
        participantId,
        postId: isPost ? item._id : undefined,
      });
      navigate(`/chat/${res.data.data._id}`);
    } catch {
      toast.error('Failed to start chat');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
      {/* Score */}
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${scoreColor}`}>
          <span>🤖</span>
          <span>{match.score}% match</span>
        </div>
        <span className="text-xs text-gray-400">📍 {match.distanceKm}km away</span>
      </div>

      {/* Content */}
      {isPost ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'request' ? 'bg-primary-100 text-primary-700' : 'bg-community-100 text-community-700'}`}>
              {item.type === 'request' ? '🙏 Request' : '🤝 Offer'}
            </span>
            <span className="text-xs text-gray-500">{item.category}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
          {item.author && (
            <p className="text-xs text-gray-400 mt-1">by {(item.author as User).name}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white font-bold">
              {item.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              <p className="text-xs text-gray-500">{item.neighborhood}</p>
            </div>
          </div>
          {item.skills && item.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.skills.slice(0, 3).map((s) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {item.badges && item.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.badges.slice(0, 2).map((b) => <BadgePill key={b} badge={b} />)}
            </div>
          )}
        </div>
      )}

      {/* AI Reason */}
      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">🧠 AI Reason: </span>{match.reason}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {isPost && (
          <Link
            to={`/posts/${item._id}`}
            className="flex-1 text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition-colors"
          >
            View Post
          </Link>
        )}
        <button
          onClick={handleStartChat}
          className="flex-1 text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 rounded-xl transition-colors"
        >
          💬 {match.suggestedAction}
        </button>
      </div>
    </div>
  );
}
