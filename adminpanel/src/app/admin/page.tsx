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
        <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-600/30 ring-2 ring-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5 text-white shadow-lg shadow-primary-900/10">
            <div className="absolute -top-10 -right-6 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-lg font-bold">Welcome back, Admin 👋</h2>
              <p className="text-white/75 text-sm mt-1">Here&apos;s what&apos;s happening across your platform today.</p>
            </div>
          </div>


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
