import React from 'react';

interface Props {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}

const config = {
  critical: { label: '🔴 Critical', className: 'bg-red-100 text-red-800 border border-red-300' },
  high: { label: '🟠 High', className: 'bg-orange-100 text-orange-800 border border-orange-300' },
  medium: { label: '🟡 Medium', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  low: { label: '🟢 Low', className: 'bg-green-100 text-green-800 border border-green-300' },
};

export default function UrgencyBadge({ urgency, size = 'sm' }: Props) {
  const { label, className } = config[urgency] || config.low;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
