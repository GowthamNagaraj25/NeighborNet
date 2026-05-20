import React, { useEffect, useState } from 'react';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

const CATEGORIES = ['', 'groceries', 'medical', 'transport', 'tools', 'repairs', 'childcare', 'elderly-care', 'education', 'blood', 'emergency', 'money-lending', 'logistics', 'other'];

export default function NoticeBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '', urgency: '', status: 'open', search: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [filters, page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12, sort: filters.sort };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await postsAPI.getAll(params);
      setPosts(res.data.data);
      setTotalPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Community Notice Board</h1>
          <p className="text-gray-500 text-sm mt-1">Browse requests and offers from your neighbors</p>
        </div>
        <Link to="/create-post" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">All Types</option>
            <option value="request">🙏 Requests</option>
            <option value="offer">🤝 Offers</option>
          </select>
          <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <select value={filters.urgency} onChange={(e) => updateFilter('urgency', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="newest">Newest First</option>
            <option value="urgent">Most Urgent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">No posts found</p>
          <p className="text-sm mt-1">Try adjusting your filters or be the first to post!</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
