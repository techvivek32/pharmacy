'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';
import StatCard, { si } from '@/components/admin/StatCard';

interface Overview {
  totalOrders: number; totalPatients: number; totalPharmacies: number; totalRiders: number;
  totalPrescriptions: number; activeOrders: number; completedOrders: number; cancelledOrders: number;
  totalQuotes: number; totalRevenue: number; thisMonthRevenue: number; lastMonthRevenue: number;
  revenueGrowth: number; ordersGrowth: number; thisMonthOrders: number; lastMonthOrders: number;
  avgOrderValue: number; completionRate: number;
}

interface DailyStat { _id: string; orders: number; revenue: number; }
interface StatusStat { _id: string; count: number; }
interface TopPharmacy { name: string; orders: number; revenue: number; }
interface TopRider { name: string; deliveries: number; earnings: number; }

interface Analytics {
  overview: Overview;
  charts: { dailyStats: DailyStat[]; last30Stats: DailyStat[]; ordersByStatus: StatusStat[]; prescriptionsByStatus: StatusStat[] };
  topPerformers: { pharmacies: TopPharmacy[]; riders: TopRider[] };
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics', { credentials: 'include' });
      const json = await res.json() as any;
      if (json.success) { setData(json.data); setLastUpdated(new Date()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const o = data?.overview;
  const growth = (v: number) => v > 0 ? `↑ ${v}%` : v < 0 ? `↓ ${Math.abs(v)}%` : '→ 0%';
  const growthColor = (v: number) => v > 0 ? 'text-emerald-600' : v < 0 ? 'text-rose-500' : 'text-gray-400';

  const statusColors: Record<string, string> = {
    delivered: 'bg-primary-500', confirmed: 'bg-purple-500', preparing: 'bg-amber-500',
    ready: 'bg-lime-500', assigned: 'bg-indigo-500', picked_up: 'bg-cyan-500',
    in_transit: 'bg-blue-500', cancelled: 'bg-rose-500', pending: 'bg-orange-500',
  };

  const maxBar = (arr: DailyStat[], key: 'orders' | 'revenue') =>
    Math.max(...arr.map(d => d[key]), 1);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Analytics"
          subtitle={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Platform performance overview'}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          actions={
            <button onClick={fetchAnalytics} disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 text-sm font-semibold transition-colors">
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Revenue"
                  tint="green"
                  value={
                    <span className="inline-flex items-baseline gap-2">
                      <span>{`${(o?.totalRevenue || 0).toLocaleString()} MRU`}</span>
                      {(o?.revenueGrowth || 0) !== 0 && (
                        <span className={`text-xs font-semibold ${growthColor(o?.revenueGrowth || 0)}`}>{growth(o?.revenueGrowth || 0)}</span>
                      )}
                    </span>
                  }
                  icon={si('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')}
                />
                <StatCard
                  label="Total Orders"
                  tint="blue"
                  value={
                    <span className="inline-flex items-baseline gap-2">
                      <span>{o?.totalOrders || 0}</span>
                      {(o?.ordersGrowth || 0) !== 0 && (
                        <span className={`text-xs font-semibold ${growthColor(o?.ordersGrowth || 0)}`}>{growth(o?.ordersGrowth || 0)}</span>
                      )}
                    </span>
                  }
                  icon={si('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z')}
                />
                <StatCard
                  label="Avg Order Value"
                  tint="purple"
                  value={`${o?.avgOrderValue || 0} MRU`}
                  icon={si('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z')}
                />
                <StatCard
                  label="Completion Rate"
                  tint="orange"
                  value={`${o?.completionRate || 0}%`}
                  icon={si('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')}
                />
              </div>

              {/* Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Patients" tint="blue" value={o?.totalPatients || 0}
                  icon={si('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z')} />
                <StatCard label="Pharmacies" tint="purple" value={o?.totalPharmacies || 0}
                  icon={si('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M9 7h.01M9 11h.01M9 15h.01M13 7h.01M13 11h.01M13 15h.01')} />
                <StatCard label="Riders" tint="green" value={o?.totalRiders || 0}
                  icon={si('M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011-1h2.586a1 1 0 00.707-.293l3.414-3.414a1 1 0 00.293-.707V11a1 1 0 00-1-1h-6a1 1 0 00-1 1v5')} />
                <StatCard label="Prescriptions" tint="orange" value={o?.totalPrescriptions || 0}
                  icon={si('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2')} />
                <StatCard label="Active Orders" tint="cyan" value={o?.activeOrders || 0}
                  icon={si('M13 10V3L4 14h7v7l9-11h-7z')} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last 30 days orders bar chart */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders — Last 30 Days</h3>
                  {data?.charts.last30Stats.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
                  ) : (
                    <div className="flex items-end gap-1" style={{ height: '128px' }}>
                      {data?.charts.last30Stats.map((d, i) => {
                        const pct = (d.orders / maxBar(data.charts.last30Stats, 'orders')) * 100;
                        return (
                          <div key={i} className="flex-1 group relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                              {d._id}: {d.orders}
                            </div>
                            <div className="w-full h-full bg-primary-500 rounded-t transition-colors group-hover:bg-primary-600" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-center">Each bar = 1 day</p>
                </div>

                {/* Order status breakdown */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Status Breakdown</h3>
                  <div className="space-y-3">
                    {data?.charts.ordersByStatus.map(s => {
                      const pct = o?.totalOrders ? Math.round((s.count / o.totalOrders) * 100) : 0;
                      const color = statusColors[s._id] || 'bg-gray-400';
                      return (
                        <div key={s._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 capitalize">{s._id.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-800">{s.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Revenue chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Revenue — Last 30 Days</h3>
                  <span className="text-sm font-medium text-gray-500">Total: {(o?.totalRevenue || 0).toLocaleString()} MRU</span>
                </div>
                {data?.charts.last30Stats.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
                ) : (
                  <div className="flex items-end gap-1" style={{ height: '96px' }}>
                    {data?.charts.last30Stats.map((d, i) => {
                      const pct = (d.revenue / maxBar(data.charts.last30Stats, 'revenue')) * 100;
                      return (
                        <div key={i} className="flex-1 group relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                            {d._id}: {d.revenue.toLocaleString()} MRU
                          </div>
                          <div className="w-full h-full bg-primary-400 rounded-t transition-colors group-hover:bg-primary-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pharmacies */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Top Pharmacies</h3>
                  </div>
                  {data?.topPerformers.pharmacies.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/70">
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">#</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pharmacy</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.topPerformers.pharmacies.map((p, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                            <td className="py-3 px-5 text-sm font-bold text-gray-400">#{i + 1}</td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                  {p.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm font-medium text-gray-800">{p.orders}</td>
                            <td className="py-3 px-5 text-sm font-semibold text-primary-600">{p.revenue.toLocaleString()} MRU</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Top Riders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Top Riders</h3>
                  </div>
                  {data?.topPerformers.riders.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/70">
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">#</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rider</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Deliveries</th>
                          <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.topPerformers.riders.map((r, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                            <td className="py-3 px-5 text-sm font-bold text-gray-400">#{i + 1}</td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                                  {r.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{r.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm font-medium text-gray-800">{r.deliveries}</td>
                            <td className="py-3 px-5 text-sm font-semibold text-primary-600">{r.earnings.toLocaleString()} MRU</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Prescription status */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Prescription Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {data?.charts.prescriptionsByStatus.map(s => (
                    <div key={s._id} className="text-center bg-gray-50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                      <p className="text-xs text-gray-500 capitalize mt-1">{s._id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
