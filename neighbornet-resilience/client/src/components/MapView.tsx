import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Post, User } from '../types';
import { Link } from 'react-router-dom';

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const urgencyColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

function createColoredIcon(color: string, type: string) {
  const emoji = type === 'request' ? '🙏' : '🤝';
  return L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function userIcon() {
  return L.divIcon({
    html: `<div style="background:#6366f1;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;">📍</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Props {
  posts: Post[];
  userLocation?: [number, number]; // [lat, lng]
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function MapView({ posts, userLocation, center, zoom = 13, height = '500px' }: Props) {
  const mapCenter: [number, number] = center || userLocation || [13.0827, 80.2707];

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {center && <RecenterMap center={center} />}

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon()}>
              <Popup>
                <div className="text-sm font-semibold">📍 Your Location</div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={500}
              pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.05, weight: 1 }}
            />
          </>
        )}

        {/* Post markers */}
        {posts.map((post) => {
          if (!post.location?.coordinates) return null;
          const [lng, lat] = post.location.coordinates;
          const color = urgencyColors[post.urgency] || '#22c55e';
          const author = post.author as User;

          return (
            <React.Fragment key={post._id}>
              <Marker
                position={[lat, lng]}
                icon={createColoredIcon(color, post.type)}
              >
                <Popup maxWidth={280}>
                  <div className="p-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.type === 'request' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {post.type === 'request' ? '🙏 Request' : '🤝 Offer'}
                      </span>
                      <span className="text-xs text-gray-500">{post.urgency}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{post.title}</h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{post.description}</p>
                    <p className="text-xs text-gray-400 mb-2">by {author?.name} · {author?.neighborhood}</p>
                    <a
                      href={`/posts/${post._id}`}
                      className="block text-center text-xs bg-primary-500 text-white py-1.5 rounded-lg font-medium hover:bg-primary-600"
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
              {post.vicinityRadiusKm && (
                <Circle
                  center={[lat, lng]}
                  radius={post.vicinityRadiusKm * 1000}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.04, weight: 1, dashArray: '4' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
