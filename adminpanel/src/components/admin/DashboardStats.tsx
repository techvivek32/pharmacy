'use client';

import { useState, useEffect } from 'react';

const icons = {
  orders: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  riders: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  revenue: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pharmacies: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

interface Stat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconKey: keyof typeof icons;
  accent: string;
  bg: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Orders', value: '—', change: '—', isPositive: true, iconKey: 'orders', accent: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Riders', value: '—', change: '—', isPositive: true, iconKey: 'riders', accent: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Revenue', value: '—', change: '—', isPositive: true, iconKey: 'revenue', accent: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Pharmacies', value: '—', change: '—', isPositive: true, iconKey: 'pharmacies', accent: 'text-purple-600', bg: 'bg-purple-50' },
  ]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        const o = data.data.overview;
        setStats([
          {
            title: 'Total Orders', value: o.totalOrders.toLocaleString(),
            change: `${o.ordersGrowth >= 0 ? '+' : ''}${o.ordersGrowth}% vs last month`,
            isPositive: o.ordersGrowth >= 0, iconKey: 'orders', accent: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            title: 'Active Riders', value: o.totalRiders.toString(),
            change: 'Total registered', isPositive: true, iconKey: 'riders', accent: 'text-green-600', bg: 'bg-green-50',
          },
          {
            title: 'Total Revenue', value: `${o.totalRevenue.toLocaleString()} MAD`,
            change: `${o.revenueGrowth >= 0 ? '+' : ''}${o.revenueGrowth}% vs last month`,
            isPositive: o.revenueGrowth >= 0, iconKey: 'revenue', accent: 'text-yellow-600', bg: 'bg-yellow-50',
          },
          {
            title: 'Pharmacies', value: o.totalPharmacies.toString(),
            change: 'Approved & active', isPositive: true, iconKey: 'pharmacies', accent: 'text-purple-600', bg: 'bg-purple-50',
          },
        ]);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
            <p className={`text-xs mt-1.5 font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {stat.change}
            </p>
          </div>
          <div className={`${stat.bg} ${stat.accent} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
            {icons[stat.iconKey]}
          </div>
        </div>
      ))}
    </div>
  );
}
