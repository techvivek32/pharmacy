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
      
      <div className="flex items-end justify-between h-64 space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{item.month}</p>
            <p className="text-xs font-semibold text-gray-800">{(item.revenue / 1000).toFixed(0)}K</p>
          </div>
        ))}
      </div>
    </div>
  );
}
