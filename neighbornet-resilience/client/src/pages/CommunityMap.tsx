import React, { useEffect, useState } from 'react';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import MapView from '../components/MapView';
import toast from 'react-hot-toast';

const CATEGORIES = ['', 'groceries', 'medical', 'transport', 'tools', 'repairs', 'childcare', 'elderly-care', 'education', 'blood', 'emergency', 'money-lending', 'logistics', 'other'];

export default function CommunityMap() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [filters, setFilters] = useState({ category: '', urgency: '', type: '' });
  const [radius, setRadius] = useState(10);
  const [useMyLocation, setUseMyLocation] = useState(false);

  // Default: Chennai center
  const defaultCenter: [number, number] = [13.0827, 80.2707];

  useEffect(() => {
    loadPosts();
  }, [filters, radius, userLocation]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let res;
      if (userLocation) {
        res = await postsAPI.getNearby(userLocation[0], userLocation[1], radius, {
          category: filters.category || undefined,
          urgency: filters.urgency || undefined,
        });
      } else {
        res = await postsAPI.getAll({
          category: filters.category || undefined,
          urgency: filters.urgency || undefined,
          type: filters.type || undefined,
          limit: 100,
        });
      }
      setPosts(res.data.data);
    } catch {
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setUseMyLocation(true);
        toast.success('Location detected!');
      },
      () => toast.error('Could not get your location')
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (filters.type && p.type !== filters.type) return false;
    return true;
  });

  const urgencyCounts = {
    critical: filteredPosts.filter((p) => p.urgency === 'critical').length,
    high: filteredPosts.filter((p) => p.urgency === 'high').length,
    medium: filteredPosts.filter((p) => p.urgency === 'medium').length,
    low: filteredPosts.filter((p) => p.urgency === 'low').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗺️ Community Map</h1>
          <p className="text-gray-500 text-sm mt-1">See all active requests and offers in your neighborhood</p>
        </div>
        <button
          onClick={handleGetLocation}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${useMyLocation ? 'bg-green-100 text-green-700' : 'bg-primary-500 text-white hover:bg-primary-600'}`}
        >
          📍 {useMyLocation ? 'Using My Location' : 'Use My Location'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">All Types</option>
            <option value="request">🙏 Requests</option>
            <option value="offer">🤝 Offers</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <select value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          {useMyLocation && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Radius:</label>
              <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {[
          { color: 'bg-red-500', label: `Critical (${urgencyCounts.critical})` },
          { color: 'bg-orange-500', label: `High (${urgencyCounts.high})` },
          { color: 'bg-yellow-400', label: `Medium (${urgencyCounts.medium})` },
          { color: 'bg-green-500', label: `Low (${urgencyCounts.low})` },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span>🙏</span><span className="text-gray-600">Request</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🤝</span><span className="text-gray-600">Offer</span>
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="bg-gray-100 rounded-2xl h-[500px] animate-pulse flex items-center justify-center">
          <p className="text-gray-400">Loading map...</p>
        </div>
      ) : (
        <MapView
          posts={filteredPosts}
          userLocation={userLocation}
          center={userLocation || defaultCenter}
          height="550px"
        />
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Showing {filteredPosts.length} posts · Click any marker to see details
      </p>
    </div>
  );
}
