'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function RidersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const riders = [
    {
      id: '1',
      name: 'Ahmed Ali',
      phone: '+212 600 000 001',
      vehicleType: 'Bike',
      vehicleNumber: 'A-12345',
      totalDeliveries: 234,
      rating: 4.9,
      status: 'online',
      earnings: '12,450 MAD',
    },
    {
      id: '2',
      name: 'Mohammed Ben',
      phone: '+212 600 000 002',
      vehicleType: 'Scooter',
      vehicleNumber: 'B-67890',
      totalDeliveries: 189,
      rating: 4.7,
      status: 'offline',
      earnings: '9,870 MAD',
    },
  ];

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
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Riders Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Riders</p>
                  <h3 className="text-2xl font-bold text-gray-800">89</h3>
                </div>
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏍️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Online Now</p>
                  <h3 className="text-2xl font-bold text-gray-800">45</h3>
                </div>
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
                </div>
                <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <h3 className="text-2xl font-bold text-gray-800">234K MAD</h3>
                </div>
                <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Search riders..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-96"
                />
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Add Rider
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rider</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Vehicle</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Deliveries</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rating</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Earnings</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr key={rider.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                            {rider.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{rider.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{rider.phone}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {rider.vehicleType} - {rider.vehicleNumber}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">{rider.totalDeliveries}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span className="font-medium text-gray-800">{rider.rating}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">{rider.earnings}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rider.status === 'online'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
