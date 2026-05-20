import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import BadgePill from '../components/BadgePill';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});

  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      if (isOwnProfile) {
        const res = await authAPI.getMe();
        setProfile(res.data.data);
        setForm(res.data.data);
      } else {
        const res = await usersAPI.getProfile(id!);
        setProfile(res.data.data);
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateMe({
        name: form.name,
        phone: form.phone,
        neighborhood: form.neighborhood,
        addressText: form.addressText,
        skills: form.skills,
        availability: form.availability,
        bloodGroup: form.bloodGroup,
        willingToDonate: form.willingToDonate,
        emergencyContact: form.emergencyContact,
      });
      setProfile(res.data.data);
      updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-primary-500 to-warm-500 rounded-3xl p-8 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-extrabold">
              {profile.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{profile.name}</h1>
              <p className="text-primary-100">{profile.neighborhood}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profile.verificationStatus === 'verified' ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                  {profile.verificationStatus === 'verified' ? '✅ Verified' : '⏳ Pending'}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{profile.role}</span>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setEditing(!editing)}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          )}
        </div>

        {/* Trust score */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-primary-100">Trust Score</span>
            <span className="text-sm font-bold">{profile.trustScore}/100</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${profile.trustScore}%` }} />
          </div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🏅 Badges</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b) => <BadgePill key={b} badge={b} size="md" />)}
          </div>
        </div>
      )}

      {/* Profile details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {editing ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Neighborhood</label>
                <input value={form.neighborhood || ''} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input value={form.availability || ''} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g. Weekends, evenings" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.addressText || ''} onChange={(e) => setForm({ ...form, addressText: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  value={(form.skills || []).join(', ')}
                  onChange={(e) => setForm({ ...form, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="plumbing, grocery delivery, tutoring..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {/* Blood donor section */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">🩸 Blood Donor Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select value={form.bloodGroup || ''} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg || 'Not specified'}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="donate" checked={form.willingToDonate || false} onChange={(e) => setForm({ ...form, willingToDonate: e.target.checked })} className="w-4 h-4 accent-red-500" />
                  <label htmlFor="donate" className="text-sm font-medium text-gray-700">Willing to donate</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Name and phone number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Details</h3>
            {[
              { label: 'Email', value: profile.email, icon: '📧' },
              { label: 'Phone', value: profile.phone, icon: '📱' },
              { label: 'Address', value: profile.addressText, icon: '🏠' },
              { label: 'Availability', value: profile.availability, icon: '🕐' },
            ].map((item) => item.value && (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">🛠️ Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.bloodGroup && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">🩸 Blood Donor</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">{profile.bloodGroup}</span>
                  <span className={`text-sm font-medium ${profile.willingToDonate ? 'text-green-600' : 'text-gray-500'}`}>
                    {profile.willingToDonate ? '✅ Willing to donate' : 'Not currently donating'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
