'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

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
              <h1 className="ml-4 text-2xl font-semibold text-gray-800">Patients Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                  <h3 className="text-2xl font-bold text-gray-800">{patients.length}</h3>
                </div>
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Patients</p>
                  <h3 className="text-2xl font-bold text-gray-800">{activePatients}</h3>
                </div>
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <h3 className="text-2xl font-bold text-gray-800">{verifiedPatients}</h3>
                </div>
                <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {patients.reduce((sum, p) => sum + p.totalOrders, 0)}
                  </h3>
                </div>
                <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Orders</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Addresses</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
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
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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