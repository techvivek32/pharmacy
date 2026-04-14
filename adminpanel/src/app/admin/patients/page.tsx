'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  addressCount: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface PatientDetails extends Patient {
  addresses: Array<{ label: string; address: string; isDefault: boolean }>;
  recentOrders: Array<{ id: string; status: string; total: number; createdAt: string }>;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => { fetchPatients(); }, [page]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/patients?page=${page}&limit=10&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data.patients);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const viewPatientDetails = async (patientId: string) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const res = await fetch(`/api/admin/patients/${patientId}`);
      const data = await res.json();
      if (data.success) setSelectedPatient(data.data.patient);
    } catch (e) { console.error(e); }
    finally { setLoadingDetails(false); }
  };

  const togglePatientStatus = async (patientId: string) => {
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/toggle-status`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) fetchPatients();
    } catch (e) { console.error(e); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString();
  const activePatients = patients.filter(p => p.isActive).length;
  const verifiedPatients = patients.filter(p => p.isVerified).length;

  const statCards = [
    { label: 'Total Patients', value: patients.length, accent: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: activePatients, accent: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Verified', value: verifiedPatients, accent: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Orders', value: patients.reduce((s, p) => s + p.totalOrders, 0), accent: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <AdminShell title="Patients">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input type="text" placeholder="Search patients..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={() => { setPage(1); fetchPatients(); }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Name', 'Email', 'Phone', 'Orders', 'Addresses', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">Loading patients...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">No patients found</td></tr>
              ) : patients.map(patient => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                        {patient.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{patient.fullName}</p>
                        {patient.isVerified && <span className="text-xs text-green-600 font-medium">✓ Verified</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-gray-600">{patient.email}</td>
                  <td className="py-3 px-5 text-sm text-gray-600">{patient.phone}</td>
                  <td className="py-3 px-5 text-sm font-medium text-gray-800">{patient.totalOrders}</td>
                  <td className="py-3 px-5 text-sm font-medium text-gray-800">{patient.addressCount}</td>
                  <td className="py-3 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${patient.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-sm text-gray-500">{fmt(patient.createdAt)}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => viewPatientDetails(patient.id)} className="text-sm font-medium text-green-600 hover:text-green-700">View</button>
                      <button onClick={() => togglePatientStatus(patient.id)}
                        className={`text-sm font-medium ${patient.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}>
                        {patient.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Patient Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              {loadingDetails ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading details...</p>
                </div>
              ) : selectedPatient ? (
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: selectedPatient.fullName },
                      { label: 'Email', value: selectedPatient.email },
                      { label: 'Phone', value: selectedPatient.phone },
                      { label: 'Status', value: selectedPatient.isActive ? 'Active' : 'Inactive' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Addresses ({selectedPatient.addresses.length})</p>
                    {selectedPatient.addresses.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.addresses.map((addr, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{addr.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{addr.address}</p>
                            </div>
                            {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">No addresses saved</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-blue-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-700">{selectedPatient.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs text-green-600 mb-1">Member Since</p>
                      <p className="text-lg font-bold text-green-700">{fmt(selectedPatient.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ) : <p className="text-center text-gray-400 py-8">Failed to load details</p>}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
