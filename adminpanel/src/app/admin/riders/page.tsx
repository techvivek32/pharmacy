'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';
import StatCard, { si } from '@/components/admin/StatCard';

interface Rider {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  licenseImageUrl?: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  createdAt: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: string;
  };
}

interface WalletTxn {
  _id: string;
  type: 'deduct' | 'add' | 'payout';
  amount: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

export default function RidersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  useEffect(() => { fetchRiders(); }, []);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/riders');
      const data = await res.json();
      if (data.success) setRiders(data.data?.riders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };


  // Earnings management modal
  const [walletRider, setWalletRider] = useState<Rider | null>(null);
  const [walletData, setWalletData] = useState<{ totalEarnings: number; transactions: WalletTxn[] } | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAction, setWalletAction] = useState<'deduct' | 'add'>('deduct');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletError, setWalletError] = useState('');

  const loadWallet = async (riderId: string) => {
    setWalletLoading(true);
    try {
      const res = await fetch(`/api/admin/riders/${riderId}/earnings`);
      const data = await res.json();
      if (data.success) setWalletData(data.data);
      else setWalletError(data.message || 'Failed to load earnings');
    } catch (e) { console.error(e); }
    finally { setWalletLoading(false); }
  };

  const openWallet = (rider: Rider) => {
    setWalletRider(rider);
    setWalletData(null);
    setWalletAction('deduct');
    setWalletAmount('');
    setWalletNote('');
    setWalletError('');
    loadWallet(rider._id);
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletRider) return;
    const amount = Number(walletAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWalletError('Enter an amount greater than zero');
      return;
    }
    const verb = walletAction === 'deduct' ? 'Deduct' : 'Add';
    if (!confirm(`${verb} ${amount.toLocaleString()} MRU ${walletAction === 'deduct' ? 'from' : 'to'} ${walletRider.userId?.fullName}'s earnings?`)) return;
    setWalletSaving(true);
    setWalletError('');
    try {
      const res = await fetch(`/api/admin/riders/${walletRider._id}/earnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: walletAction, amount, note: walletNote }),
      });
      const data = await res.json();
      if (data.success) {
        setWalletAmount('');
        setWalletNote('');
        loadWallet(walletRider._id);
        fetchRiders();
      } else {
        setWalletError(data.message || 'Failed to update earnings');
      }
    } catch (e) { console.error(e); }
    finally { setWalletSaving(false); }
  };

  const filtered = riders.filter(r =>
    r.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.phone?.includes(search)
  );

  const totalEarnings = riders.reduce((sum, r) => sum + (r.totalEarnings || 0), 0);
  const onlineCount = riders.filter(r => r.isOnline).length;
  const avgRating = riders.length ? (riders.reduce((s, r) => s + r.rating, 0) / riders.length).toFixed(1) : '0.0';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Riders Management"
          subtitle={`${riders.length} registered riders`}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Riders" value={riders.length} tint="blue" icon={si('M13 10V3L4 14h7v7l9-11h-7z')} />
            <StatCard label="Online Now" value={onlineCount} tint="green" icon={si('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')} />
            <StatCard label="Avg Rating" value={avgRating} tint="yellow" icon={si('M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z')} />
            <StatCard label="Total Earnings" value={`${totalEarnings.toLocaleString()} MRU`} tint="purple" icon={si('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input type="text" placeholder="Search riders by name, email or phone..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" />
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">{si('M13 10V3L4 14h7v7l9-11h-7z')}</div>
                <p className="text-gray-500 font-medium">No riders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {['Rider', 'Contact', 'Vehicle', 'Deliveries', 'Earnings', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3.5 px-6 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(rider => (
                      <tr key={rider._id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {rider.userId?.profileImage ? (
                              <img src={rider.userId.profileImage} className="w-10 h-10 rounded-full object-cover mr-3" />
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                                {rider.userId?.fullName?.charAt(0) || 'R'}
                              </div>
                            )}
                            <span className="font-medium text-gray-800">{rider.userId?.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div>{rider.userId?.email}</div>
                          <div className="text-xs text-gray-400">{rider.userId?.phone}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 capitalize">
                          <div>{rider.vehicleType}</div>
                          <div className="text-xs text-gray-400">{rider.vehicleNumber || '—'}</div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-800">{rider.totalDeliveries}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-800">{rider.totalEarnings.toLocaleString()} MRU</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span className="font-medium text-gray-800">{rider.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rider.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedRider(rider)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs font-semibold transition-colors">
                              View More
                            </button>
                            <button onClick={() => openWallet(rider)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-semibold transition-colors">
                              💰 Earnings
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View More Modal */}
      {selectedRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Rider Details</h2>
              <button onClick={() => setSelectedRider(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-5">
              {/* Profile */}
              <div className="flex items-center mb-5">
                {selectedRider.userId?.profileImage ? (
                  <img src={selectedRider.userId.profileImage} className="w-16 h-16 rounded-full object-cover mr-4" />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
                    {selectedRider.userId?.fullName?.charAt(0) || 'R'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedRider.userId?.fullName}</h3>
                  <p className="text-sm text-gray-500">{selectedRider.userId?.email}</p>
                  <p className="text-sm text-gray-500">{selectedRider.userId?.phone}</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total Deliveries', value: selectedRider.totalDeliveries, icon: '📦' },
                  { label: 'Total Earnings', value: `${selectedRider.totalEarnings.toLocaleString()} MRU`, icon: '💰' },
                  { label: 'Rating', value: `${selectedRider.rating.toFixed(1)} ⭐`, icon: '⭐' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-lg font-bold text-gray-800">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Vehicle Type', value: selectedRider.vehicleType },
                  { label: 'Vehicle Number', value: selectedRider.vehicleNumber || '—' },
                  { label: 'License Number', value: selectedRider.licenseNumber },
                  { label: 'Status', value: selectedRider.isOnline ? '🟢 Online' : '⚫ Offline' },
                  { label: 'Available', value: selectedRider.isAvailable ? 'Yes' : 'No' },
                  { label: 'Account Active', value: selectedRider.userId?.isActive ? 'Yes' : 'No' },
                  { label: 'Joined', value: new Date(selectedRider.userId?.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-800 capitalize">{item.value}</span>
                  </div>
                ))}
                {selectedRider.licenseImageUrl && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">License Image</span>
                    <a href={selectedRider.licenseImageUrl} target="_blank" rel="noreferrer"
                      className="text-primary-600 hover:underline font-medium">View Image</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Management Modal */}
      {walletRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Earnings Management</h2>
                <p className="text-sm text-gray-500">{walletRider.userId?.fullName}</p>
              </div>
              <button onClick={() => setWalletRider(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-5 overflow-y-auto">
              {/* Balance */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 text-center">
                <div className="text-sm text-purple-700 mb-1">Current Earnings</div>
                <div className="text-3xl font-bold text-purple-800">
                  {walletData ? `${walletData.totalEarnings.toLocaleString()} MRU` : walletLoading ? '...' : '—'}
                </div>
              </div>

              {/* Deduct / Add form */}
              <form onSubmit={handleWalletSubmit} className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {(['deduct', 'add'] as const).map(a => (
                    <button key={a} type="button" onClick={() => setWalletAction(a)}
                      className={`py-2 rounded-lg text-sm font-medium border ${walletAction === a
                        ? a === 'deduct' ? 'bg-red-600 text-white border-red-600' : 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                      {a === 'deduct' ? '− Deduct' : '+ Add'}
                    </button>
                  ))}
                </div>
                <input type="number" min="0" step="0.01" placeholder="Amount (MRU)"
                  value={walletAmount} onChange={e => setWalletAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="text" maxLength={300} placeholder="Reason / note (optional)"
                  value={walletNote} onChange={e => setWalletNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                {walletError && <p className="text-sm text-red-600">{walletError}</p>}
                <button type="submit" disabled={walletSaving || !walletAmount}
                  className={`w-full py-2 rounded-lg text-white font-medium disabled:opacity-60 ${walletAction === 'deduct' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {walletSaving ? 'Saving...' : walletAction === 'deduct' ? 'Deduct from Earnings' : 'Add to Earnings'}
                </button>
              </form>

              {/* History */}
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Adjustment History</h3>
              {walletLoading && !walletData ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : !walletData?.transactions.length ? (
                <p className="text-sm text-gray-400">No adjustments yet</p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                  {walletData.transactions.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <div className="font-medium text-gray-800">
                          {t.type === 'deduct' ? 'Deducted' : t.type === 'add' ? 'Added' : 'Paid out'}
                        </div>
                        {t.note && <div className="text-xs text-gray-500">{t.note}</div>}
                        <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'add' ? '+' : '−'}{t.amount.toLocaleString()} MRU
                        </div>
                        <div className="text-xs text-gray-400">Bal: {t.balanceAfter.toLocaleString()} MRU</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
