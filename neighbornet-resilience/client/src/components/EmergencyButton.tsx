import React, { useState } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EMERGENCY_CATEGORIES = [
  { value: 'medical', label: '💊 Medical', desc: 'Doctor, medicine, hospital' },
  { value: 'blood', label: '🩸 Blood', desc: 'Blood donor needed' },
  { value: 'groceries', label: '🛒 Food', desc: 'Food or essentials' },
  { value: 'transport', label: '🚗 Transport', desc: 'Urgent ride needed' },
  { value: 'emergency', label: '🚨 Safety', desc: 'Safety emergency' },
  { value: 'money-lending', label: '💰 Financial', desc: 'Emergency funds' },
];

export default function EmergencyButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      toast.error('Please select a category and describe your emergency');
      return;
    }
    setLoading(true);
    try {
      const res = await postsAPI.create({
        type: 'request',
        title: `URGENT: ${EMERGENCY_CATEGORIES.find((c) => c.value === category)?.label} Help Needed`,
        category,
        description,
        urgency: 'critical',
        vicinityRadiusKm: 5,
        location: user?.location,
        tags: ['emergency', 'urgent', category],
      });
      toast.success('Emergency request sent! Nearby residents are being notified.');
      setOpen(false);
      setCategory('');
      setDescription('');
      navigate(`/posts/${res.data.data._id}`);
    } catch {
      toast.error('Failed to send emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all animate-pulse-slow"
      >
        <span className="text-lg">🚨</span>
        <span>Emergency Help</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-red-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-xl font-bold">🚨 Emergency Help Request</h2>
              <p className="text-red-100 text-sm mt-1">Nearby verified residents will be notified immediately</p>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">What do you need?</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {EMERGENCY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${category === cat.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                  >
                    <div className="font-semibold text-sm">{cat.label}</div>
                    <div className="text-xs text-gray-500">{cat.desc}</div>
                  </button>
                ))}
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your emergency briefly..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending...' : '🚨 Send Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
