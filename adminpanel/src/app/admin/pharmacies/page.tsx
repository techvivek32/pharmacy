'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  address: string;
  totalOrders: number;
  rating: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function PharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPharmacies(); }, []);

  const fetchPharmacies = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pharmacies?search=${q}`);
      const data = await res.json();
      if (data.success) setPharmacies(data.data?.pharmacies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchPharmacies(e.target.value);
  };

  const active = pharmacies.filter(p => p.isActive).length;
  const avgRating = pharmacies.length
    ? (pharmacies.reduce((s, p) => s + (p.rating || 0), 0) / pharmacies.length).toFixed(1)
    : '0';

  return (
    <AdminShell title="Pharmacies">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Total Pharmacies', value: pharmacies.length, icon: '🏥', color: 'bg-purple-500' },
              { label: 'Active', value: active, icon: '✅', color: 'bg-green-500' },
              { label: 'Avg Rating', value: avgRating, icon: '⭐', color: 'bg-yellow-500' },
              { label: 'Inactive', value: pharmacies.length - active, icon: '⏸️', color: 'bg-gray-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{s.label}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{s.value}</h3>
                  </div>
                  <div className={`${s.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search pharmacies..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
              />
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading...</div>
              ) : pharmacies.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No pharmacies found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {['Pharmacy', 'License', 'Address', 'Phone', 'Orders', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-4 px-6 text-sm font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacies.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-3">
                              {p.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">{p.licenseNumber}</td>
                        <td className="py-4 px-6 text-gray-600 text-sm max-w-xs truncate">{p.address}</td>
                        <td className="py-4 px-6 text-gray-600 text-sm">{p.phone}</td>
                        <td className="py-4 px-6 font-medium text-gray-800">{p.totalOrders}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span className="font-medium text-gray-800">{p.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => router.push(`/admin/pharmacies/${p.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
          </div>
    </AdminShell>
  );
}
