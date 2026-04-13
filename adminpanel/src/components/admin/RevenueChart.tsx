'use client';

export default function RevenueChart() {
  const data = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 35000 },
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Revenue Overview</h2>
      
      <div className="flex items-end justify-between space-x-4" style={{ height: '256px' }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center" style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}>
            <div className="w-full h-full bg-primary-500 rounded-t-lg transition-all duration-500" />
            <p className="text-xs text-gray-600 mt-2 shrink-0">{item.month}</p>
            <p className="text-xs font-semibold text-gray-800 shrink-0">{(item.revenue / 1000).toFixed(0)}K</p>
          </div>
        ))}
      </div>
    </div>
  );
}
