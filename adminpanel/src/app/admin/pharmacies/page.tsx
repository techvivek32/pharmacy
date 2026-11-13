'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';
import StatCard, { si } from '@/components/admin/StatCard';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Pharmacies"
          subtitle={`${pharmacies.length} registered pharmacies`}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Pharmacies" value={pharmacies.length} tint="purple" icon={si('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4')} />
            <StatCard label="Active" value={active} tint="green" icon={si('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')} />
            <StatCard label="Avg Rating" value={avgRating} tint="yellow" icon={si('M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z')} />
            <StatCard label="Inactive" value={pharmacies.length - active} tint="gray" icon={si('M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z')} />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search pharmacies..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading...</div>
              ) : pharmacies.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">{si('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4')}</div>
                  <p className="text-gray-500 font-medium">No pharmacies found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {['Pharmacy', 'License', 'Address', 'Phone', 'Orders', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacies.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs font-semibold transition-colors"
                          >
                            View
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
