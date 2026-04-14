'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentOrders from '@/components/admin/RecentOrders';
import RevenueChart from '@/components/admin/RevenueChart';
import PlatformOverview from '@/components/admin/PlatformOverview';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">Admin</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI Stats Row */}
          <DashboardStats />

          {/* Chart + Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <RevenueChart />
            </div>
            <div className="lg:col-span-2">
              <RecentOrders />
            </div>
          </div>

          {/* Platform Overview: order status + top performers */}
          <PlatformOverview />

        </main>
      </div>
    </div>
  );
}
