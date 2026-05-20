import React, { useEffect, useState } from 'react';
import { usersAPI, postsAPI, messagesAPI } from '../services/api';
import { User, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UrgencyBadge from '../components/UrgencyBadge';
import BadgePill from '../components/BadgePill';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodHelp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<User[]>([]);
  const [bloodRequests, setBloodRequests] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'donors'>('requests');
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ bloodGroup: '', description: '', urgency: 'critical', vicinityRadiusKm: 15 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterGroup]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [donorsRes, postsRes] = await Promise.all([
        usersAPI.getBloodDonors({ bloodGroup: filterGroup || undefined }),
        postsAPI.getAll({ category: 'blood', status: 'open', limit: 20 }),
      ]);
      setDonors(donorsRes.data.data);
      setBloodRequests(postsRes.data.data);
    } catch {
      toast.error('Failed to load blood help data');
    } finally {
      setLoading(false);
    }
  };

  const handleContactDonor = async (donor: User) => {
    if (donor._id === user?._id) { toast.error("That's you!"); return; }
    try {
      const res = await messagesAPI.createThread({ participantId: donor._id });
      navigate(`/chat/${res.data.data._id}`);
    } catch {
      toast.error('Failed to start chat');
    }
  };

  const handleCreateRequest = async () => {
    if (!requestForm.bloodGroup || !requestForm.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      await postsAPI.create({
        type: 'request',
        title: `Urgent: ${requestForm.bloodGroup} Blood Donor Needed`,
        category: 'blood',
        description: requestForm.description,
        urgency: requestForm.urgency,
        vicinityRadiusKm: requestForm.vicinityRadiusKm,
        tags: ['blood', requestForm.bloodGroup, 'urgent', 'donor'],
        location: user?.location,
      });
      toast.success('Blood request created! Nearby donors will be notified.');
      setShowCreateRequest(false);
      loadData();
    } catch {
      toast.error('Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">🩸 Blood Help Network</h1>
            <p className="text-red-100">Connect blood donors with those in urgent need. Every donation saves a life.</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{donors.length}</div>
                <div className="text-xs text-red-100">Registered Donors</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{bloodRequests.length}</div>
                <div className="text-xs text-red-100">Active Requests</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateRequest(true)}
            className="bg-white text-red-600 font-bold px-5 py-3 rounded-2xl hover:bg-red-50 transition-colors shadow-lg"
          >
            + Blood Request
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'requests', label: '🚨 Blood Requests', count: bloodRequests.length },
          { key: 'donors', label: '🩸 Find Donors', count: donors.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'requests' | 'donors')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === tab.key ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Blood group filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filter by blood group:</span>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            onClick={() => setFilterGroup(bg)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${filterGroup === bg ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
          >
            {bg || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : activeTab === 'requests' ? (
        <div>
          {bloodRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">✅</p>
              <p>No active blood requests right now.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloodRequests.map((post) => {
                const author = post.author as User;
                return (
                  <div key={post._id} className={`bg-white rounded-2xl border shadow-sm p-5 ${post.urgency === 'critical' ? 'border-red-300 border-l-4 border-l-red-500' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">🩸</span>
                      <UrgencyBadge urgency={post.urgency} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>by {author?.name}</span>
                      <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}</span>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/posts/${post._id}`} className="flex-1 text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition-colors">
                        View Details
                      </a>
                      <button
                        onClick={async () => {
                          if (author?._id === user?._id) return;
                          try {
                            const res = await messagesAPI.createThread({ participantId: author._id, postId: post._id });
                            navigate(`/chat/${res.data.data._id}`);
                          } catch { toast.error('Failed'); }
                        }}
                        className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-xl transition-colors"
                      >
                        🩸 I Can Donate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {donors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🩸</p>
              <p>No donors found{filterGroup ? ` for ${filterGroup}` : ''}.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((donor) => (
                <div key={donor._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                      {donor.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-gray-900">{donor.name}</p>
                        {donor.verificationStatus === 'verified' && <span className="text-blue-500 text-xs">✅</span>}
                      </div>
                      <p className="text-sm text-gray-500">{donor.neighborhood}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-red-100 text-red-700 font-bold text-lg px-3 py-1 rounded-xl">
                        {donor.bloodGroup}
                      </span>
                    </div>
                  </div>
                  {donor.badges && donor.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {donor.badges.slice(0, 2).map((b) => <BadgePill key={b} badge={b} />)}
                    </div>
                  )}
                  {donor.lastDonationDate && (
                    <p className="text-xs text-gray-400 mb-3">
                      Last donated: {new Date(donor.lastDonationDate).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleContactDonor(donor)}
                    disabled={donor._id === user?._id}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
                  >
                    {donor._id === user?._id ? 'That\'s You' : '💬 Contact Donor'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create request modal */}
      {showCreateRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-red-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-xl font-bold">🩸 Create Blood Request</h2>
              <p className="text-red-100 text-sm mt-1">Nearby donors will be notified immediately</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Required *</label>
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.filter(Boolean).map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Hospital name, patient details, contact info..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius (km)</label>
                  <input
                    type="number"
                    value={requestForm.vicinityRadiusKm}
                    onChange={(e) => setRequestForm({ ...requestForm, vicinityRadiusKm: Number(e.target.value) })}
                    min={1} max={50}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreateRequest(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreateRequest} disabled={creating} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-60">
                  {creating ? 'Creating...' : '🩸 Send Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
