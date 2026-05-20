import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['groceries', 'medical', 'transport', 'tools', 'repairs', 'childcare', 'elderly-care', 'education', 'blood', 'emergency', 'money-lending', 'logistics', 'other'];

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'request', title: '', category: 'other', description: '',
    urgency: 'medium', vicinityRadiusKm: 5, tags: '',
    neededByDate: '', amountNeeded: '', repaymentDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.verificationStatus !== 'verified') {
      toast.error('You must be verified to create posts');
      navigate('/verify');
      return;
    }
    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        type: form.type,
        title: form.title,
        category: form.category,
        description: form.description,
        urgency: form.urgency,
        vicinityRadiusKm: Number(form.vicinityRadiusKm),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        location: user?.location || { type: 'Point', coordinates: [80.2707, 13.0827] },
      };
      if (form.neededByDate) data.neededByDate = form.neededByDate;
      if (form.category === 'money-lending' && form.amountNeeded) {
        data.amountNeeded = Number(form.amountNeeded);
        if (form.repaymentDate) data.repaymentDate = form.repaymentDate;
      }
      const res = await postsAPI.create(data);
      toast.success('Post created successfully!');
      navigate(`/posts/${res.data.data._id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create post';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✍️ Create New Post</h1>
        <p className="text-gray-500 text-sm mt-1">Share what you need or what you can offer</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'request', label: '🙏 I Need Help', desc: 'Request assistance' },
                { value: 'offer', label: '🤝 I Can Help', desc: 'Offer your skills' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${form.type === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief, clear title for your post"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency *</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your need or offer in detail. Be specific — our AI will match you better!"
              required
              rows={4}
              minLength={10}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* Money lending fields */}
          {form.category === 'money-lending' && (
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <p className="text-xs text-yellow-700 font-semibold mb-3">⚠️ Community support only. Platform does not process payments.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount Needed (₹)</label>
                  <input
                    type="number"
                    value={form.amountNeeded}
                    onChange={(e) => setForm({ ...form, amountNeeded: e.target.value })}
                    placeholder="e.g. 2000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Repayment Date</label>
                  <input
                    type="date"
                    value={form.repaymentDate}
                    onChange={(e) => setForm({ ...form, repaymentDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags & Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="plumbing, urgent, kitchen"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vicinity Radius (km)</label>
              <input
                type="number"
                value={form.vicinityRadiusKm}
                onChange={(e) => setForm({ ...form, vicinityRadiusKm: Number(e.target.value) })}
                min={1} max={50}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Needed by date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Needed By (optional)</label>
            <input
              type="date"
              value={form.neededByDate}
              onChange={(e) => setForm({ ...form, neededByDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-60 text-base"
          >
            {loading ? 'Creating...' : '✨ Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
