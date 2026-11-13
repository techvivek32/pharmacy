'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';
import StatCard, { si } from '@/components/admin/StatCard';

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
  addresses: Array<{
    label: string;
    address: string;
    isDefault: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

export default function PatientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/patients?page=${page}&limit=10&search=${searchTerm}`);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data.patients);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patientId: string) => {
    try {
      setLoadingDetails(true);
      setShowModal(true);
      
      const response = await fetch(`/api/admin/patients/${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPatient(data.data.patient);
      }
    } catch (error) {
      console.error('Failed to load patient details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const togglePatientStatus = async (patientId: string) => {
    try {
      const response = await fetch(`/api/admin/patients/${patientId}/toggle-status`, {
        method: 'PUT',
      });
      const data = await response.json();
      
      if (data.success) {
        fetchPatients(); // Reload the list
      }
    } catch (error) {
      console.error('Failed to toggle patient status:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPatients();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const activePatients = patients.filter(p => p.isActive).length;
  const verifiedPatients = patients.filter(p => p.isVerified).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Patients Management"
          subtitle={`${patients.length} registered patients`}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Patients" value={patients.length} tint="blue" icon={si('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z')} />
            <StatCard label="Active Patients" value={activePatients} tint="green" icon={si('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')} />
            <StatCard label="Verified" value={verifiedPatients} tint="purple" icon={si('M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z')} />
            <StatCard label="Total Orders" value={patients.reduce((sum, p) => sum + p.totalOrders, 0)} tint="orange" icon={si('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z')} />
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Addresses</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Loading patients...
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                              {patient.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">{patient.fullName}</span>
                              {patient.isVerified && (
                                <span className="ml-2 text-green-500">✓</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{patient.email}</td>
                        <td className="py-4 px-6 text-gray-600">{patient.phone}</td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">{patient.totalOrders}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-800">{patient.addressCount}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              patient.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {patient.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => viewPatientDetails(patient.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => togglePatientStatus(patient.id)}
                            className={`text-sm font-medium ${
                              patient.isActive
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-green-600 hover:text-green-700'
                            }`}
                          >
                            {patient.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Patient Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Patient Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading details...</p>
                </div>
              ) : selectedPatient ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <p className="font-medium">{selectedPatient.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium">{selectedPatient.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <p className={`font-medium ${selectedPatient.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedPatient.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Addresses ({selectedPatient.addresses.length})</h3>
                    {selectedPatient.addresses.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.addresses.map((address, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No addresses saved</p>
                    )}
                  </div>

                  {/* Order Stats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Order Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Total Orders</p>
                        <p className="text-xl font-bold text-blue-800">{selectedPatient.totalOrders}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Member Since</p>
                        <p className="text-xl font-bold text-green-800">{formatDate(selectedPatient.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Failed to load patient details</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}