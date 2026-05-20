import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, messagesAPI } from '../services/api';
import { Post, User } from '../types';
import { useAuth } from '../context/AuthContext';
import UrgencyBadge from '../components/UrgencyBadge';
import BadgePill from '../components/BadgePill';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (id) loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await postsAPI.getById(id!);
      setPost(res.data.data);
    } catch {
      toast.error('Post not found');
      navigate('/notice-board');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    const author = post?.author as User;
    if (!author?._id || author._id === user?._id) {
      toast.error("You can't chat with yourself");
      return;
    }
    try {
      const res = await messagesAPI.createThread({ participantId: author._id, postId: post?._id });
      navigate(`/chat/${res.data.data._id}`);
    } catch {
      toast.error('Failed to start chat');
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      const res = await postsAPI.updateStatus(post!._id, { status: newStatus, completionNote });
      setPost(res.data.data);
      setShowStatusModal(false);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  if (!post) return null;

  const author = post.author as User;
  const isOwner = user?._id === author?._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
        ← Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header band */}
        <div className={`p-6 ${post.urgency === 'critical' ? 'bg-red-50 border-b-2 border-red-200' : post.urgency === 'high' ? 'bg-orange-50 border-b border-orange-100' : 'bg-gray-50 border-b border-gray-100'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{categoryIcons[post.category] || '📌'}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.type === 'request' ? 'bg-primary-100 text-primary-700' : 'bg-community-100 text-community-700'}`}>
                    {post.type === 'request' ? '🙏 Request' : '🤝 Offer'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{post.category}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <UrgencyBadge urgency={post.urgency} size="md" />
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[post.status]}`}>
                {post.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{post.description}</p>
          </div>

          {/* Money lending info */}
          {post.category === 'money-lending' && post.amountNeeded && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-1">💰 Financial Support Request</p>
              <p className="text-sm text-yellow-700">Amount needed: <strong>₹{post.amountNeeded}</strong></p>
              {post.repaymentDate && (
                <p className="text-sm text-yellow-700">Repayment by: <strong>{new Date(post.repaymentDate).toLocaleDateString()}</strong></p>
              )}
              <p className="text-xs text-yellow-600 mt-2">⚠️ Community support only. Platform does not process payments.</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Vicinity</p>
              <p className="font-semibold text-gray-800">📍 {post.vicinityRadiusKm}km radius</p>
            </div>
            {post.neededByDate && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Needed By</p>
                <p className="font-semibold text-gray-800">📅 {new Date(post.neededByDate).toLocaleDateString()}</p>
              </div>
            )}
            {post.createdAt && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Posted</p>
                <p className="font-semibold text-gray-800">🕐 {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
              </div>
            )}
          </div>

          {/* Author */}
          <div className="bg-gradient-to-r from-primary-50 to-warm-50 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Posted By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white font-bold text-lg">
                {author?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{author?.name}</p>
                  {author?.verificationStatus === 'verified' && <span className="text-blue-500 text-sm">✅</span>}
                </div>
                <p className="text-sm text-gray-500">{author?.neighborhood}</p>
                {author?.trustScore && (
                  <p className="text-xs text-gray-400">Trust Score: {author.trustScore}/100</p>
                )}
              </div>
              <Link to={`/profile/${author?._id}`} className="text-sm text-primary-600 font-medium hover:underline">
                View Profile
              </Link>
            </div>
            {author?.badges && author.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {author.badges.map((b) => <BadgePill key={b} badge={b} />)}
              </div>
            )}
          </div>

          {/* Completion note */}
          {post.completionNote && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-green-800">✅ Completion Note</p>
              <p className="text-sm text-green-700 mt-1">{post.completionNote}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {!isOwner && post.status !== 'completed' && post.status !== 'cancelled' && (
              <>
                <button
                  onClick={handleStartChat}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  💬 {post.type === 'request' ? 'Offer Help' : 'Request This'}
                </button>
                <Link
                  to={`/ai-matches?postId=${post._id}`}
                  className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  🧠 View AI Matches
                </Link>
              </>
            )}
            {canModify && post.status !== 'completed' && post.status !== 'cancelled' && (
              <button
                onClick={() => { setShowStatusModal(true); setNewStatus('completed'); }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                ✅ Mark Completed
              </button>
            )}
            {canModify && (
              <button
                onClick={() => { setShowStatusModal(true); setNewStatus(''); }}
                className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                ⚙️ Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Update Post Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Select status</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowStatusModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={!newStatus || statusLoading} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl disabled:opacity-60">
                {statusLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
