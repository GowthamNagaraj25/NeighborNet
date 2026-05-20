import React, { useEffect, useState } from 'react';
import { initiativesAPI } from '../services/api';
import { Initiative } from '../types';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Initiatives() {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetCategory: '', requiredVolunteers: 5, actionPlan: '' });
  const [creating, setCreating] = useState(false);

  const canCreate = user?.role === 'organizer' || user?.role === 'admin';

  useEffect(() => {
    loadInitiatives();
  }, []);

  const loadInitiatives = async () => {
    try {
      const res = await initiativesAPI.getAll();
      setInitiatives(res.data.data);
    } catch {
      toast.error('Failed to load initiatives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    setCreating(true);
    try {
      await initiativesAPI.create({ ...form, location: user?.location });
      toast.success('Initiative created!');
      setShowCreate(false);
      setForm({ title: '', description: '', targetCategory: '', requiredVolunteers: 5, actionPlan: '' });
      loadInitiatives();
    } catch {
      toast.error('Failed to create initiative');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await initiativesAPI.updateStatus(id, status);
      toast.success('Status updated');
      loadInitiatives();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusColors: Record<string, string> = {
    planned: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏘️ Community Initiatives</h1>
          <p className="text-gray-500 text-sm mt-1">Organized drives and programs to strengthen the neighborhood</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            + New Initiative
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : initiatives.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🏘️</p>
          <p className="text-lg font-medium">No initiatives yet</p>
          {canCreate && <p className="text-sm mt-1">Create the first community initiative!</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {initiatives.map((init) => {
            const organizer = init.organizer as User;
            return (
              <div key={init._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{init.title}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[init.status]}`}>
                    {init.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{init.description}</p>

                {init.actionPlan && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <p className="text-xs font-semibold text-blue-700 mb-1">📋 Action Plan</p>
                    <p className="text-xs text-blue-800 whitespace-pre-line">{init.actionPlan}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {init.targetCategory && <span>📂 {init.targetCategory}</span>}
                  <span>👥 {init.requiredVolunteers} volunteers needed</span>
                </div>

                {init.requiredResources && init.requiredResources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {init.requiredResources.map((r) => (
                      <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white text-xs font-bold">
                      {organizer?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{organizer?.name}</p>
                      <p className="text-xs text-gray-400">{init.createdAt ? formatDistanceToNow(new Date(init.createdAt), { addSuffix: true }) : ''}</p>
                    </div>
                  </div>
                  {canCreate && init.status !== 'completed' && (
                    <div className="flex gap-2">
                      {init.status === 'planned' && (
                        <button onClick={() => handleStatusUpdate(init._id, 'active')} className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg">Activate</button>
                      )}
                      {init.status === 'active' && (
                        <button onClick={() => handleStatusUpdate(init._id, 'completed')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg">Complete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">🏘️ Create Initiative</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Check-in Drive" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Category</label>
                  <input value={form.targetCategory} onChange={(e) => setForm({ ...form, targetCategory: e.target.value })} placeholder="e.g. elderly-care" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volunteers Needed</label>
                  <input type="number" value={form.requiredVolunteers} onChange={(e) => setForm({ ...form, requiredVolunteers: Number(e.target.value) })} min={1} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Plan</label>
                <textarea value={form.actionPlan} onChange={(e) => setForm({ ...form, actionPlan: e.target.value })} rows={3} placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreate} disabled={creating} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Initiative'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
