'use client';

import { useState, useEffect } from 'react';

interface DailyStat { _id: string; orders: number; revenue: number; }

export default function RevenueChart() {
  const [data, setData] = useState<DailyStat[]>([]);
  const [view, setView] = useState<'revenue' | 'orders'>('revenue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data.charts.last30Stats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxVal = Math.max(...data.map(d => d[view]), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Last 30 Days</h2>
        <div className="flex gap-2">
          {(['revenue', 'orders'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${view === v ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: '200px' }}>
          No data yet
        </div>
      ) : (
        <>
          <div className="flex items-end gap-0.5" style={{ height: '180px' }}>
            {data.map((d, i) => {
              const pct = (d[view] / maxVal) * 100;
              return (
                <div key={i} className="flex-1 group relative" style={{ height: `${Math.max(pct, 2)}%` }}>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                    {d._id}: {view === 'revenue' ? `${d.revenue.toLocaleString()} MAD` : d.orders}
                  </div>
                  <div className={`w-full h-full rounded-t transition-all ${view === 'revenue' ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{data[0]?._id}</span>
            <span>{data[data.length - 1]?._id}</span>
          </div>
        </>
      )}
    </div>
  );
}
