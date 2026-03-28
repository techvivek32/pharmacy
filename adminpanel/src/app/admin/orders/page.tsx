'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/admin/Sidebar';

interface User {
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

interface Patient {
  _id: string;
  userId: User;
}

interface Prescription {
  imageUrl: string;
  deliveryAddress?: { address: string };
}

interface Order {
  _id: string;
  orderNumber: string;
  patientId: Patient;
  pharmacyId?: { pharmacyName: string; address?: string; phone?: string };
  riderId?: { fullName: string; phone?: string };
  prescriptionId?: Prescription;
  totalAmount: number;
  status: string;
  deliveryAddress?: { address: string };
  paymentMethod?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
      const response = await fetch(`/api/orders?page=${pagination.page}&limit=10${status}`);
      const data = await response.json() as any;
      if (data.success) {
        setOrders(Array.isArray(data.data?.orders) ? data.data.orders : []);
        setPagination(p => ({ ...p, total: data.data?.pagination?.total || 0, pages: data.data?.pagination?.pages || 1 }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (order: Order) => {
    return order.patientId?.userId?.fullName || 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  const deliveryAddress = (order: Order) =>
    order.deliveryAddress?.address ||
    order.prescriptionId?.deliveryAddress?.address ||
    'N/A';

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
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Orders Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex space-x-2 flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setSelectedStatus(status); setPagination(p => ({ ...p, page: 1 })); }}
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders found</div>
              ) : (
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
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{getPatientName(order)}</td>
                        <td className="py-4 px-6 text-gray-600">{order.pharmacyId?.pharmacyName || '—'}</td>
                        <td className="py-4 px-6 text-gray-600">{order.riderId?.fullName || 'Unassigned'}</td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">{order.totalAmount} MAD</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium">{pagination.total}</span> orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm">{pagination.page}</span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient Information</h3>
                <div className="flex items-center gap-4">
                  {selectedOrder.patientId?.userId?.profileImage ? (
                    <img
                      src={selectedOrder.patientId.userId.profileImage}
                      alt="Patient"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold border-2 border-white shadow">
                      {getPatientName(selectedOrder).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800 text-lg">{getPatientName(selectedOrder)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedOrder.patientId?.userId?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedOrder.patientId?.userId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery Address</h3>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-700">{deliveryAddress(selectedOrder)}</p>
                </div>
              </div>

              {/* Prescription Image */}
              {selectedOrder.prescriptionId?.imageUrl && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Prescription Image</h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={selectedOrder.prescriptionId.imageUrl}
                      alt="Prescription"
                      className="w-full object-contain max-h-72"
                    />
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Pharmacy</p>
                    <p className="font-medium text-gray-800">{selectedOrder.pharmacyId?.pharmacyName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rider</p>
                    <p className="font-medium text-gray-800">{selectedOrder.riderId?.fullName || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium text-gray-800">{selectedOrder.totalAmount} MAD</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment</p>
                    <p className="font-medium text-gray-800 capitalize">{selectedOrder.paymentMethod || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
