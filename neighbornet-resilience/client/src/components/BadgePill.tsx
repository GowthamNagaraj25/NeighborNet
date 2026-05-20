import React from 'react';

const badgeConfig: Record<string, { icon: string; color: string }> = {
  'Verified Resident': { icon: '✅', color: 'bg-blue-100 text-blue-800' },
  'First Helper': { icon: '🌟', color: 'bg-yellow-100 text-yellow-800' },
  'Blood Donor': { icon: '🩸', color: 'bg-red-100 text-red-800' },
  'Tool Sharer': { icon: '🔧', color: 'bg-gray-100 text-gray-800' },
  'Emergency Responder': { icon: '🚨', color: 'bg-orange-100 text-orange-800' },
  'Elder Support': { icon: '👴', color: 'bg-purple-100 text-purple-800' },
  'Community Organizer': { icon: '🏘️', color: 'bg-green-100 text-green-800' },
  'Completed 5 Helps': { icon: '🏆', color: 'bg-amber-100 text-amber-800' },
};

interface Props {
  badge: string;
  size?: 'sm' | 'md';
}

export default function BadgePill({ badge, size = 'sm' }: Props) {
  const config = badgeConfig[badge] || { icon: '🎖️', color: 'bg-gray-100 text-gray-700' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${config.color}`}>
      <span>{config.icon}</span>
      <span>{badge}</span>
    </span>
  );
}
