'use client';

import { useState, useEffect } from 'react';

export default function DashboardStats() {
  const [stats, setStats] = useState([
    {
      title: 'Total Orders',
      value: '0',
      change: '+0%',
      isPositive: true,
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Riders',
      value: '0',
      change: '+0%',
      isPositive: true,
      icon: '🏍️',
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: '0 MAD',
      change: '+0%',
      isPositive: true,
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: 'Pharmacies',
      value: '0',
      change: '+0%',
      isPositive: true,
      icon: '🏥',
      color: 'bg-purple-500',
    },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      if (data.success) {
        const overview = data.data.overview;
        setStats([
          {
            title: 'Total Orders',
            value: overview.totalOrders.toLocaleString(),
            change: '+12.5%',
            isPositive: true,
            icon: '📦',
            color: 'bg-blue-500',
          },
          {
            title: 'Active Riders',
            value: overview.totalRiders.toString(),
            change: '+5.2%',
            isPositive: true,
            icon: '🏍️',
            color: 'bg-green-500',
          },
          {
            title: 'Total Revenue',
            value: `${overview.totalRevenue.toLocaleString()} MAD`,
            change: '+18.3%',
            isPositive: true,
            icon: '💰',
            color: 'bg-yellow-500',
          },
          {
            title: 'Pharmacies',
            value: overview.totalPharmacies.toString(),
            change: '+3.1%',
            isPositive: true,
            icon: '🏥',
            color: 'bg-purple-500',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className={`text-sm mt-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </div>
            <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
