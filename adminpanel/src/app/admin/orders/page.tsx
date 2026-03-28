'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const orders = [
    {
      id: 'ORD-001',
      patient: 'John Doe',
      pharmacy: 'City Pharmacy',
      rider: 'Ahmed Ali',
      amount: '120 MAD',
      status: 'delivered',
      date: '2024-03-08 14:30',
    },
    {
      id: 'ORD-002',
      patient: 'Jane Smith',
      pharmacy: 'Health Plus',
      rider: 'Mohammed Ben',
      amount: '85 MAD',
      status: 'in_transit',
      date: '2024-03-08 15:45',
    },
    {
      id: 'ORD-003',
      patient: 'Mike Johnson',
      pharmacy: 'MediCare',
      rider: 'Youssef',
      amount: '150 MAD',
      status: 'preparing',
      date: '2024-03-08 16:00',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
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
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Orders Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex space-x-2">
              {['all', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Search orders..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Export
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Patient</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pharmacy</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rider</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">{order.id}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{order.patient}</td>
                      <td className="py-4 px-6 text-gray-600">{order.pharmacy}</td>
                      <td className="py-4 px-6 text-gray-600">{order.rider}</td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">{order.amount}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{order.date}</td>
                      <td className="py-4 px-6">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                <span className="font-medium">100</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
