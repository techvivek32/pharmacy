'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';
import StatCard, { si } from '@/components/admin/StatCard';

interface PharmacyRow {
  pharmacyId: string;
  pharmacyName: string;
  phone: string;
  orders: number;
  medicinesRevenue: number;
  serviceFees: number;
  deliveryFees: number;
  totalCollected: number;
}

interface Totals {
  orders: number;
  medicinesRevenue: number;
  serviceFees: number;
  deliveryFees: number;
  totalCollected: number;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function PharmacyRevenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PharmacyRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);

  const now = new Date();
  const [from, setFrom] = useState(fmtDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(fmtDate(now));

  const fetchData = async (f = from, t = to) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pharmacy-revenue?from=${f}&to=${t}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.data?.pharmacies || []);
        setTotals(data.data?.totals || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const preset = (which: 'thisMonth' | 'lastMonth' | 'last7' | 'last30') => {
    const n = new Date();
    let f: Date, t: Date;
    if (which === 'thisMonth') { f = new Date(n.getFullYear(), n.getMonth(), 1); t = n; }
    else if (which === 'lastMonth') { f = new Date(n.getFullYear(), n.getMonth() - 1, 1); t = new Date(n.getFullYear(), n.getMonth(), 0); }
    else if (which === 'last7') { f = new Date(n.getTime() - 7 * 864e5); t = n; }
    else { f = new Date(n.getTime() - 30 * 864e5); t = n; }
    const fs = fmtDate(f), ts = fmtDate(t);
    setFrom(fs); setTo(ts);
    fetchData(fs, ts);
  };

  const exportCsv = () => {
    const header = 'Pharmacy,Phone,Orders,Medicines Revenue (MRU),Service Fees Owed (MRU),Delivery Fees (MRU),Total Collected (MRU)';
    const lines = rows.map(r =>
      `"${r.pharmacyName.replace(/"/g, '""')}","${r.phone}",${r.orders},${r.medicinesRevenue},${r.serviceFees},${r.deliveryFees},${r.totalCollected}`
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pharmacy-revenue-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const num = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Pharmacy Revenue"
          subtitle="Settle platform fees with pharmacies by period"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          actions={
            <button onClick={exportCsv} disabled={rows.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary-600/20 disabled:opacity-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Period picker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-3">
            <div className="flex space-x-2">
              {([['thisMonth', 'This Month'], ['lastMonth', 'Last Month'], ['last7', 'Last 7 Days'], ['last30', 'Last 30 Days']] as const).map(([k, label]) => (
                <button key={k} onClick={() => preset(k)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors">
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 ml-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                  className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
              </div>
              <button onClick={() => fetchData()}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-colors">
                Apply
              </button>
            </div>
          </div>

          {/* Totals cards */}
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Delivered Orders" value={totals.orders.toLocaleString()} tint="blue" icon={si('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z')} />
              <StatCard label="Medicines Revenue" value={`${num(totals.medicinesRevenue)} MRU`} tint="purple" icon={si('M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z')} />
              <StatCard label="Service Fees Owed" value={`${num(totals.serviceFees)} MRU`} tint="green" icon={si('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')} />
              <StatCard label="Delivery Fees" value={`${num(totals.deliveryFees)} MRU`} tint="orange" icon={si('M13 10V3L4 14h7v7l9-11h-7z')} />
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No delivered orders in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pharmacy</th>
                      <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Medicines Revenue</th>
                      <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Service Fees Owed</th>
                      <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Delivery Fees</th>
                      <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.pharmacyId} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-800">{r.pharmacyName}</div>
                          <div className="text-xs text-gray-400">{r.phone}</div>
                        </td>
                        <td className="py-4 px-6 text-right text-gray-600">{r.orders}</td>
                        <td className="py-4 px-6 text-right text-gray-800">{num(r.medicinesRevenue)} MRU</td>
                        <td className="py-4 px-6 text-right font-semibold text-green-700">{num(r.serviceFees)} MRU</td>
                        <td className="py-4 px-6 text-right text-gray-600">{num(r.deliveryFees)} MRU</td>
                        <td className="py-4 px-6 text-right text-gray-800">{num(r.totalCollected)} MRU</td>
                      </tr>
                    ))}
                    {totals && (
                      <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                        <td className="py-4 px-6 text-gray-800">Total ({rows.length} pharmacies)</td>
                        <td className="py-4 px-6 text-right">{totals.orders}</td>
                        <td className="py-4 px-6 text-right">{num(totals.medicinesRevenue)} MRU</td>
                        <td className="py-4 px-6 text-right text-green-700">{num(totals.serviceFees)} MRU</td>
                        <td className="py-4 px-6 text-right">{num(totals.deliveryFees)} MRU</td>
                        <td className="py-4 px-6 text-right">{num(totals.totalCollected)} MRU</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Based on delivered orders only. &quot;Service Fees Owed&quot; is what the platform collects from each pharmacy for the period.
          </p>
        </main>
      </div>
    </div>
  );
}
