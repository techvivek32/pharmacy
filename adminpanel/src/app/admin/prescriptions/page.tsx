'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

interface Prescription {
  _id: string;
  patientId: {
    name: string;
    phone: string;
  };
  images: string[];
  status: string;
  createdAt: string;
  quotesCount?: number;
}

export default function PrescriptionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions');
      const data = await response.json() as any;
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Prescriptions Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Prescriptions</p>
                  <h3 className="text-2xl font-bold text-gray-800">{prescriptions.length}</h3>
                </div>
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {prescriptions.filter(p => p.status === 'pending').length}
                  </h3>
                </div>
                <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quoted</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {prescriptions.filter(p => p.status === 'quoted').length}
                  </h3>
                </div>
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {prescriptions.filter(p => p.status === 'confirmed').length}
                  </h3>
                </div>
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-96"
                />
                <div className="flex space-x-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No prescriptions found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Patient</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Images</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Quotes</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {prescription._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                              {prescription.patientId?.name?.charAt(0) || 'P'}
                            </div>
                            <span className="font-medium text-gray-800">
                              {prescription.patientId?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {prescription.patientId?.phone || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">
                            {prescription.images?.length || 0} image(s)
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">
                            {prescription.quotesCount || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">
                            View
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Quotes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
