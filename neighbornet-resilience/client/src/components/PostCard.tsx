import React from 'react';
import { Link } from 'react-router-dom';
import { Post, User } from '../types';
import UrgencyBadge from './UrgencyBadge';
import BadgePill from './BadgePill';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons: Record<string, string> = {
  groceries: '🛒', medical: '💊', transport: '🚗', tools: '🔧',
  repairs: '🔨', childcare: '👶', 'elderly-care': '👴', education: '📚',
  blood: '🩸', emergency: '🚨', 'money-lending': '💰', logistics: '📦', other: '📌',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  matched: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

interface Props {
  post: Post;
  showDistance?: boolean;
}

export default function PostCard({ post, showDistance }: Props) {
  const author = post.author as User;
  const isVerified = author?.verificationStatus === 'verified';

  return (
    <Link to={`/posts/${post._id}`} className="block group">
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 ${post.urgency === 'critical' ? 'border-l-4 border-l-red-500' : post.urgency === 'high' ? 'border-l-4 border-l-orange-400' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[post.category] || '📌'}</span>
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${post.type === 'request' ? 'bg-primary-100 text-primary-700' : 'bg-community-100 text-community-700'}`}>
                {post.type === 'request' ? '🙏 Request' : '🤝 Offer'}
              </span>
            </div>
          </div>
          <UrgencyBadge urgency={post.urgency} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.description}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white text-xs font-bold">
              {author?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{author?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-400">{author?.neighborhood || ''}</p>
            </div>
            {isVerified && (
              <span className="text-xs text-blue-600" title="Verified Resident">✅</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showDistance && post.distanceKm !== undefined && (
              <span className="text-xs text-gray-400">📍 {post.distanceKm.toFixed(1)}km</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[post.status]}`}>
              {post.status}
            </span>
          </div>
        </div>

        {/* Time */}
        {post.createdAt && (
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
