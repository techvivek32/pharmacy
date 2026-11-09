'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

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
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Pharmacy Revenue</h1>
            </div>
            <button onClick={exportCsv} disabled={rows.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
              ⬇ Export CSV
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Period picker */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-3">
            <div className="flex space-x-2">
              {([['thisMonth', 'This Month'], ['lastMonth', 'Last Month'], ['last7', 'Last 7 Days'], ['last30', 'Last 30 Days']] as const).map(([k, label]) => (
                <button key={k} onClick={() => preset(k)}
                  className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 ml-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <button onClick={() => fetchData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Apply
              </button>
            </div>
          </div>

          {/* Totals cards */}
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Delivered Orders', value: totals.orders.toLocaleString(), color: 'bg-blue-500', icon: '📦' },
                { label: 'Medicines Revenue', value: `${num(totals.medicinesRevenue)} MRU`, color: 'bg-purple-500', icon: '💊' },
                { label: 'Service Fees Owed to Platform', value: `${num(totals.serviceFees)} MRU`, color: 'bg-green-500', icon: '💰' },
                { label: 'Delivery Fees', value: `${num(totals.deliveryFees)} MRU`, color: 'bg-orange-500', icon: '🏍️' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center">
                  <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-white text-lg mr-3`}>{c.icon}</div>
                  <div>
                    <div className="text-lg font-bold text-gray-800">{c.value}</div>
                    <div className="text-xs text-gray-500">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No delivered orders in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pharmacy</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Orders</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Medicines Revenue</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Service Fees Owed</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Delivery Fees</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Total Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.pharmacyId} className="border-b border-gray-100 hover:bg-gray-50">
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
                      <tr className="bg-gray-50 font-semibold">
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
