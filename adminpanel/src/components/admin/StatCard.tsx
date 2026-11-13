'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tint?: 'green' | 'blue' | 'purple' | 'orange' | 'cyan' | 'rose' | 'yellow' | 'gray';
}

const tints: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-500',
  cyan: 'bg-cyan-50 text-cyan-600',
  rose: 'bg-rose-50 text-rose-500',
  yellow: 'bg-amber-50 text-amber-500',
  gray: 'bg-gray-100 text-gray-500',
};

export default function StatCard({ label, value, icon, tint = 'green' }: StatCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`${tints[tint]} w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 truncate mt-4">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export const si = (d: string): ReactNode => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);
