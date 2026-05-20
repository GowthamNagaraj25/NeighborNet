import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  trend?: string;
}

export default function StatCard({ title, value, icon, color = 'bg-white', subtitle, trend }: Props) {
  return (
    <div className={`${color} rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-green-600 font-medium mt-1">{trend}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
