import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI, aiAPI } from '../services/api';
import { Post, CommunityPulse } from '../types';
import StatCard from '../components/StatCard';
import PostCard from '../components/PostCard';
import EmergencyButton from '../components/EmergencyButton';
import BadgePill from '../components/BadgePill';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [pulse, setPulse] = useState<CommunityPulse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsAPI.getAll({ limit: 6, sort: 'newest' }),
      aiAPI.getCommunityPulse(),
    ]).then(([postsRes, pulseRes]) => {
      setRecentPosts(postsRes.data.data);
      setPulse(pulseRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const isVerified = user?.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.neighborhood ? `${user.neighborhood} · ` : ''}
            <span className={`font-medium ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {isVerified ? '✅ Verified Resident' : '⏳ Verification Pending'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EmergencyButton />
          <Link
            to="/create-post"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            + New Post
          </Link>
        </div>
      </div>

      {/* Verification banner */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-800">⚠️ Complete your verification</p>
            <p className="text-sm text-yellow-700 mt-0.5">Verified residents can create posts and access all features</p>
          </div>
          <Link to="/verify" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            Verify Now
          </Link>
        </div>
      )}

      {/* Stats */}
      {pulse && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Active Requests" value={pulse.totalRequests} icon="🙏" color="bg-red-50" />
          <StatCard title="Active Offers" value={pulse.totalOffers} icon="🤝" color="bg-green-50" />
          <StatCard title="Urgent Needs" value={pulse.urgentNeeds} icon="🚨" color="bg-orange-50" />
          <StatCard title="Helps Completed" value={pulse.completedHelps} icon="✅" color="bg-blue-50" />
        </div>
      )}

      {/* Badges */}
      {user?.badges && user.badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🏅 Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b) => <BadgePill key={b} badge={b} size="md" />)}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/notice-board', icon: '📋', label: 'Notice Board', desc: 'Browse all posts' },
          { to: '/ai-matches', icon: '🧠', label: 'AI Matches', desc: 'Find your matches' },
          { to: '/map', icon: '🗺️', label: 'Community Map', desc: 'See nearby activity' },
          { to: '/blood-help', icon: '🩸', label: 'Blood Help', desc: 'Donors & requests' },
        ].map((action) => (
          <Link key={action.to} to={action.to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-200 transition-all text-center group">
            <div className="text-3xl mb-2">{action.icon}</div>
            <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-600">{action.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{action.desc}</div>
          </Link>
        ))}
      </div>

      {/* Community Pulse */}
      {pulse && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white">
          <h3 className="font-bold text-lg mb-4">📊 Community Pulse</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Total Members</p>
              <p className="text-2xl font-bold">{pulse.totalUsers}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Verified</p>
              <p className="text-2xl font-bold text-green-400">{pulse.verifiedUsers}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">This Week</p>
              <p className="text-2xl font-bold text-yellow-400">{pulse.weeklyActivity} posts</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Top Category</p>
              <p className="text-lg font-bold text-primary-300">{pulse.topCategory?.name || 'N/A'}</p>
            </div>
          </div>
          {pulse.topNeighborhoods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-xs mb-2">Top neighborhoods needing help:</p>
              <div className="flex flex-wrap gap-2">
                {pulse.topNeighborhoods.slice(0, 4).map((n) => (
                  <span key={n._id} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                    {n._id || 'Unknown'} ({n.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Recent Community Posts</h3>
          <Link to="/notice-board" className="text-sm text-primary-600 font-medium hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
