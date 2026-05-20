import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Verify() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ addressProofType: '', neighborhoodCode: '', localReferenceName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authAPI.submitVerification(form);
      updateUser(res.data.data);
      toast.success('Verification submitted! An admin will review your request.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await authAPI.simulateVerification();
      updateUser(res.data.data);
      toast.success('✅ Verification simulated! You are now a verified resident.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to simulate verification');
    } finally {
      setSimulating(false);
    }
  };

  if (user?.verificationStatus === 'verified') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Verified!</h1>
        <p className="text-gray-500 mb-6">You are a verified resident of NeighborNet.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏘️</div>
        <h1 className="text-2xl font-bold text-gray-900">Community Verification</h1>
        <p className="text-gray-500 text-sm mt-2">
          Verify your residency to unlock all features and build community trust
        </p>
      </div>

      {/* Demo simulation button */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Demo Mode</h3>
        <p className="text-sm text-blue-700 mb-3">
          For the hackathon demo, click below to instantly simulate verification and unlock all features.
        </p>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {simulating ? 'Simulating...' : '⚡ Simulate Verification (Demo)'}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or submit for admin review</span></div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address Proof Type *</label>
            <select
              value={form.addressProofType}
              onChange={(e) => setForm({ ...form, addressProofType: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Select proof type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Utility Bill">Utility Bill</option>
              <option value="Rental Agreement">Rental Agreement</option>
              <option value="Passport">Passport</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Neighborhood Code *</label>
            <input
              type="text"
              value={form.neighborhoodCode}
              onChange={(e) => setForm({ ...form, neighborhoodCode: e.target.value })}
              placeholder="e.g. ANN-2024, TNR-001"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <p className="text-xs text-gray-400 mt-1">Ask your neighborhood coordinator for this code</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Local Reference Name *</label>
            <input
              type="text"
              value={form.localReferenceName}
              onChange={(e) => setForm({ ...form, localReferenceName: e.target.value })}
              placeholder="Name of a verified neighbor who can vouch for you"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-gray-50 rounded-2xl p-4">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">What happens next?</h4>
        <ul className="space-y-1 text-sm text-gray-500">
          <li>✓ Your submission is reviewed by a community admin</li>
          <li>✓ Verification typically takes 24-48 hours</li>
          <li>✓ You'll receive a "Verified Resident" badge once approved</li>
          <li>✓ Verified residents can create posts and access all features</li>
        </ul>
      </div>
    </div>
  );
}
