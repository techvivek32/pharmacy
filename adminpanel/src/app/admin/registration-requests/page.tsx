'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

interface RiderRequest {
  _id: string;
  licenseNumber: string;
  licenseImageUrl: string;
  vehicleType: string;
  vehicleNumber: string;
  approvalStatus: string;
  adminNote: string;
  createdAt: string;
  userId: { fullName: string; email: string; phone: string };
}

interface PharmacyRequest {
  _id: string;
  pharmacyName: string;
  licenseNumber: string;
  address: string;
  location: { coordinates: [number, number] };
  approvalStatus: string;
  adminNote: string;
  createdAt: string;
  userId: { fullName: string; email: string; phone: string };
}

export default function RegistrationRequestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [type, setType] = useState<'rider' | 'pharmacy'>('rider');
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [riderRequests, setRiderRequests] = useState<RiderRequest[]>([]);
  const [pharmacyRequests, setPharmacyRequests] = useState<PharmacyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<RiderRequest | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, [type, statusTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (type === 'rider') {
        const res = await fetch(`/api/admin/rider-requests?status=${statusTab}`);
        const data = await res.json();
        if (data.success) setRiderRequests(data.data?.requests || []);
      } else {
        const res = await fetch(`/api/admin/pharmacy-requests?status=${statusTab}`);
        const data = await res.json();
        if (data.success) setPharmacyRequests(data.data?.requests || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const endpoint = type === 'rider' ? `/api/admin/rider-requests/${id}/approve` : `/api/admin/pharmacy-requests/${id}/approve`;
      await fetch(endpoint, { method: 'POST' });
      setSelectedRider(null); setSelectedPharmacy(null);
      fetchRequests();
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    const id = type === 'rider' ? selectedRider?._id : selectedPharmacy?._id;
    if (!id) return;
    setActionLoading(true);
    try {
      const endpoint = type === 'rider' ? `/api/admin/rider-requests/${id}/reject` : `/api/admin/pharmacy-requests/${id}/reject`;
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: rejectNote }) });
      setShowRejectModal(false); setSelectedRider(null); setSelectedPharmacy(null); setRejectNote('');
      fetchRequests();
    } finally { setActionLoading(false); }
  };

  const statusBadge = (status: string) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const getMapUrl = (req: PharmacyRequest) => {
    const [lng, lat] = req.location?.coordinates || [0, 0];
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center px-6 py-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-4 text-2xl font-semibold text-gray-800">Registration Requests</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Type switcher */}
          <div className="flex space-x-2 mb-4">
            <button onClick={() => setType('rider')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${type === 'rider' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              🏍️ Riders
            </button>
            <button onClick={() => setType('pharmacy')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${type === 'pharmacy' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              🏥 Pharmacies
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex space-x-2 mb-6">
            {(['pending', 'approved', 'rejected'] as const).map(tab => (
              <button key={tab} onClick={() => setStatusTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusTab === tab ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : type === 'rider' ? (
              riderRequests.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No {statusTab} rider requests</div>
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
                      {riderRequests.map(req => (
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
                                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">View Image</a>
                            ) : <span className="text-xs text-gray-400">No image</span>}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(req.approvalStatus)}`}>{req.approvalStatus}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                            {req.approvalStatus === 'pending' && (
                              <div className="flex space-x-2">
                                <button onClick={() => handleApprove(req._id)} disabled={actionLoading}
                                  className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50">✓ Approve</button>
                                <button onClick={() => { setSelectedRider(req); setShowRejectModal(true); }}
                                  className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">✕ Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              pharmacyRequests.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No {statusTab} pharmacy requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pharmacy</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Owner</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">License</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Address</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pharmacyRequests.map(req => (
                        <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-800">{req.pharmacyName}</td>
                          <td className="py-4 px-6 text-gray-600">{req.userId?.fullName}</td>
                          <td className="py-4 px-6 text-gray-600">
                            <div>{req.userId?.email}</div>
                            <div className="text-xs text-gray-400">{req.userId?.phone}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{req.licenseNumber}</td>
                          <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{req.address}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(req.approvalStatus)}`}>{req.approvalStatus}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button onClick={() => { setSelectedPharmacy(req); setShowMapModal(true); }}
                                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">📍 Map</button>
                              {req.approvalStatus === 'pending' && (
                                <>
                                  <button onClick={() => handleApprove(req._id)} disabled={actionLoading}
                                    className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50">✓ Approve</button>
                                  <button onClick={() => { setSelectedPharmacy(req); setShowRejectModal(true); }}
                                    className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">✕ Reject</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Map Modal (pharmacy) */}
      {showMapModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{selectedPharmacy.pharmacyName}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedPharmacy.address}</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm border-b">
              <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{selectedPharmacy.userId?.fullName}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedPharmacy.userId?.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedPharmacy.userId?.phone}</span></div>
              <div><span className="text-gray-500">License:</span> <span className="font-medium">{selectedPharmacy.licenseNumber}</span></div>
            </div>
            <iframe src={getMapUrl(selectedPharmacy)} className="w-full h-72 border-0" loading="lazy" />
            {selectedPharmacy.approvalStatus === 'pending' && (
              <div className="flex space-x-3 p-5 border-t">
                <button onClick={() => { handleApprove(selectedPharmacy._id); setShowMapModal(false); }} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-60">✓ Approve</button>
                <button onClick={() => { setShowMapModal(false); setShowRejectModal(true); }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">✕ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (selectedRider || selectedPharmacy) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Reject Request</h2>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting <strong>{type === 'rider' ? selectedRider?.userId?.fullName : selectedPharmacy?.pharmacyName}</strong>. Add a note explaining the reason.
            </p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..." rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
            <div className="flex space-x-3 mt-4">
              <button onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading || !rejectNote.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-60">
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
