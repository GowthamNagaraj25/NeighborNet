import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await postsAPI.getMyPosts();
      setPosts(res.data.data);
    } catch {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const filtered = filter ? posts.filter((p) => p.status === filter) : posts;

  const counts = {
    open: posts.filter((p) => p.status === 'open').length,
    matched: posts.filter((p) => p.status === 'matched').length,
    completed: posts.filter((p) => p.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 My Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your requests and offers</p>
        </div>
        <Link to="/create-post" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open', count: counts.open, color: 'bg-green-50 text-green-700' },
          { label: 'Matched', count: counts.matched, color: 'bg-blue-50 text-blue-700' },
          { label: 'Completed', count: counts.completed, color: 'bg-gray-50 text-gray-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'open', 'matched', 'in-progress', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">No posts found</p>
          <Link to="/create-post" className="text-primary-600 font-medium hover:underline mt-2 block">Create your first post →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <div key={post._id} className="relative">
              <PostCard post={post} />
              <div className="flex gap-2 mt-2">
                <Link to={`/posts/${post._id}`} className="flex-1 text-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition-colors">
                  View / Edit Status
                </Link>
                <Link to={`/ai-matches?postId=${post._id}`} className="flex-1 text-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-xl transition-colors">
                  🧠 AI Matches
                </Link>
                {post.status !== 'completed' && (
                  <button onClick={() => handleDelete(post._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2 rounded-xl transition-colors">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
