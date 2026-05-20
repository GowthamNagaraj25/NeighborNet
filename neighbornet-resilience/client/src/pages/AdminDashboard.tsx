import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { User, Post } from '../types';
import BadgePill from '../components/BadgePill';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const BADGES = ['Verified Resident', 'First Helper', 'Blood Donor', 'Tool Sharer', 'Emergency Responder', 'Elder Support', 'Community Organizer', 'Completed 5 Helps'];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [filterStatus, setFilterStatus] = useState('');
  const [badgeModal, setBadgeModal] = useState<{ userId: string; name: string } | null>(null);
  const [selectedBadge, setSelectedBadge] = useState('');

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        adminAPI.getUsers({ status: filterStatus || undefined }),
        adminAPI.getPosts(),
      ]);
      setUsers(usersRes.data.data);
      setPosts(postsRes.data.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, status: string) => {
    try {
      await adminAPI.verifyUser(userId, status);
      toast.success(`User ${status} successfully`);
      loadData();
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const handleAssignBadge = async () => {
    if (!badgeModal || !selectedBadge) return;
    try {
      await adminAPI.assignBadge(badgeModal.userId, selectedBadge);
      toast.success(`Badge "${selectedBadge}" assigned to ${badgeModal.name}`);
      setBadgeModal(null);
      setSelectedBadge('');
      loadData();
    } catch {
      toast.error('Failed to assign badge');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await adminAPI.deletePost(postId);
      toast.success('Post deleted');
      loadData();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const pendingCount = users.filter((u) => u.verificationStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, verify residents, and moderate content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-500">Pending Verification</div>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{users.filter((u) => u.verificationStatus === 'verified').length}</div>
          <div className="text-sm text-gray-500">Verified Residents</div>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
          <div className="text-sm text-gray-500">Total Posts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'users', label: `👥 Users${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}` },
          { key: 'posts', label: '📋 Posts' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'users' | 'posts')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {s || 'All'} {s === 'pending' && pendingCount > 0 && <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white font-bold">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                        </div>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">{u.neighborhood} · Trust: {u.trustScore}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : u.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {u.verificationStatus}
                      </span>
                      {u.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => handleVerify(u._id, 'verified')} className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">✅ Verify</button>
                          <button onClick={() => handleVerify(u._id, 'rejected')} className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">❌ Reject</button>
                        </>
                      )}
                      <button onClick={() => setBadgeModal({ userId: u._id, name: u.name })} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold px-3 py-1.5 rounded-lg transition-colors">🏅 Badge</button>
                    </div>
                  </div>
                  {u.badges && u.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {u.badges.map((b) => <BadgePill key={b} badge={b} />)}
                    </div>
                  )}
                  {u.verificationSubmission && (
                    <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800">
                      <strong>Verification Submission:</strong> {u.verificationSubmission.addressProofType} · Code: {u.verificationSubmission.neighborhoodCode} · Ref: {u.verificationSubmission.localReferenceName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />)}</div>
          ) : (
            posts.map((post) => {
              const author = post.author as User;
              return (
                <div key={post._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.type === 'request' ? 'bg-primary-100 text-primary-700' : 'bg-community-100 text-community-700'}`}>{post.type}</span>
                        <span className="text-xs text-gray-500">{post.category}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.urgency === 'critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{post.urgency}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">by {author?.name} · {author?.email}</p>
                      <p className="text-xs text-gray-400">{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/posts/${post._id}`} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition-colors">View</a>
                      <button onClick={() => handleDeletePost(post._id)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Badge modal */}
      {badgeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🏅 Assign Badge to {badgeModal.name}</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {BADGES.map((badge) => (
                <button
                  key={badge}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${selectedBadge === badge ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <BadgePill badge={badge} />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setBadgeModal(null); setSelectedBadge(''); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssignBadge} disabled={!selectedBadge} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl disabled:opacity-60">Assign Badge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
