'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface RiderRequest {
  _id: string;
  licenseNumber: string;
  licenseImageUrl: string;
  vehicleType: string;
  vehicleNumber: string;
  approvalStatus: string;
  adminNote: string;
  createdAt: string;
  userId: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export default function RiderRequestsPage() {
  const [requests, setRequests] = useState<RiderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<RiderRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rider-requests?status=${activeTab}`);
      const data = await res.json();
      if (data.success) setRequests(data.data?.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/rider-requests/${id}/approve`, { method: 'POST' });
      setSelectedRequest(null);
      fetchRequests();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/rider-requests/${selectedRequest._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: rejectNote }),
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectNote('');
      fetchRequests();
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminShell title="Rider Requests">
          <div className="flex space-x-2 mb-6">
            {(['pending', 'approved', 'rejected'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No {activeTab} requests</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rider</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Vehicle</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">License</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">License Image</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-800">{req.userId?.fullName}</td>
                        <td className="py-4 px-6 text-gray-600">
                          <div>{req.userId?.email}</div>
                          <div className="text-xs text-gray-400">{req.userId?.phone}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="capitalize">{req.vehicleType}</div>
                          <div className="text-xs text-gray-400">{req.vehicleNumber}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{req.licenseNumber}</td>
                        <td className="py-4 px-6">
                          {req.licenseImageUrl ? (
                            <a href={req.licenseImageUrl} target="_blank" rel="noreferrer"
                              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                              View Image
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No image</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(req.approvalStatus)}`}>
                            {req.approvalStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          {req.approvalStatus === 'pending' && (
                            <div className="flex space-x-2">
                              <button onClick={() => handleApprove(req._id)}
                                disabled={actionLoading}
                                className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50">
                                ✓ Approve
                              </button>
                              <button onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
                                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Reject Request</h2>
            <p className="text-sm text-gray-500 mb-4">Rejecting <strong>{selectedRequest.userId?.fullName}</strong>. Add a note for the rider.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading || !rejectNote.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-60">
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
