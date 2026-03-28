'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

interface AnalyticsData {
  revenue: {
    total: number;
    daily: Array<{ date: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
  };
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  users: {
    patients: number;
    pharmacies: number;
    riders: number;
  };
  topPharmacies: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json() as { success: boolean; data: AnalyticsData };
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
            </div>
            <div className="flex space-x-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading analytics...</div>
            </div>
          ) : (
            <>
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {analytics?.revenue?.total?.toLocaleString() ?? 0} MAD
                      </h3>
                      <p className="text-xs text-green-600 mt-1">↑ 12.5% from last month</p>
                    </div>
                    <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {analytics?.orders?.total ?? 0}
                      </h3>
                      <p className="text-xs text-green-600 mt-1">↑ 8.3% from last month</p>
                    </div>
                    <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {analytics?.orders?.total 
                          ? Math.round((analytics.revenue?.total ?? 0) / analytics.orders.total)
                          : 0} MAD
                      </h3>
                      <p className="text-xs text-green-600 mt-1">↑ 5.2% from last month</p>
                    </div>
                    <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {analytics?.orders?.total
                          ? Math.round(((analytics.orders?.completed ?? 0) / analytics.orders.total) * 100)
                          : 0}%
                      </h3>
                      <p className="text-xs text-green-600 mt-1">↑ 3.1% from last month</p>
                    </div>
                    <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm font-medium text-gray-800">
                          {analytics?.orders?.completed ?? 0} orders
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics?.orders?.total 
                              ? ((analytics.orders?.completed ?? 0) / analytics.orders.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="text-sm font-medium text-gray-800">
                          {analytics?.orders?.pending ?? 0} orders
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics?.orders?.total 
                              ? ((analytics.orders?.pending ?? 0) / analytics.orders.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Cancelled</span>
                        <span className="text-sm font-medium text-gray-800">
                          {analytics?.orders?.cancelled ?? 0} orders
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics?.orders?.total 
                              ? ((analytics.orders?.cancelled ?? 0) / analytics.orders.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">👥</span>
                        <div>
                          <p className="text-sm text-gray-600">Total Patients</p>
                          <p className="text-xl font-bold text-gray-800">
                            {analytics?.users?.patients ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">🏥</span>
                        <div>
                          <p className="text-sm text-gray-600">Active Pharmacies</p>
                          <p className="text-xl font-bold text-gray-800">
                            {analytics?.users?.pharmacies ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">🏍️</span>
                        <div>
                          <p className="text-sm text-gray-600">Active Riders</p>
                          <p className="text-xl font-bold text-gray-800">
                            {analytics?.users?.riders ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Pharmacies */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Top Performing Pharmacies</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rank</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pharmacy</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Orders</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Revenue</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.topPharmacies?.map((pharmacy, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-gray-800">#{index + 1}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-3">
                                {pharmacy.name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-800">{pharmacy.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-800">{pharmacy.orders}</td>
                          <td className="py-4 px-6 font-medium text-gray-800">
                            {pharmacy.revenue.toLocaleString()} MAD
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-800">
                            {Math.round(pharmacy.revenue / pharmacy.orders)} MAD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
