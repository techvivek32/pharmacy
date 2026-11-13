'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import PageHeader from '@/components/admin/PageHeader';

interface ServiceFeeTier {
  maxAmount: number;
  fee: number;
}

interface Settings {
  deliveryFee: number;
  minDeliveryFee: number;
  serviceFeeTiers: ServiceFeeTier[];
  serviceFeeAbove: number;
  minOrderAmount: number;
  maxDeliveryRadius: number;
  minWithdrawalAmount: number;
  supportEmail: string;
  supportPhone: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    deliveryFee: 25,
    minDeliveryFee: 100,
    serviceFeeTiers: [
      { maxAmount: 500, fee: 50 },
      { maxAmount: 1000, fee: 70 },
      { maxAmount: 2000, fee: 100 },
    ],
    serviceFeeAbove: 150,
    minOrderAmount: 50,
    maxDeliveryRadius: 10,
    minWithdrawalAmount: 100,
    supportEmail: 'support@ordogo.com',
    supportPhone: '+212 600 000 000',
    razorpayKeyId: '',
    razorpayKeySecret: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) return;
      const data = await response.json() as any;
      if (data.success && data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as any;
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="System Settings"
          subtitle="Configure delivery fees, service tiers, payouts and integrations"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          actions={
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary-600/20 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading settings...</div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* General Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Delivery Fee (MRU/km)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryFee}
                      onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Minimum Delivery Fee (MRU)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.minDeliveryFee}
                      onChange={(e) => setSettings({ ...settings, minDeliveryFee: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The customer never pays less than this for delivery (distance counted pharmacy → customer only).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Minimum Order Amount (MRU)
                    </label>
                    <input
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={settings.maxDeliveryRadius}
                      onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Pharmacy Fee Tiers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Pharmacy Fee (Service Fee)</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Flat fee charged per order based on the medicine subtotal. Orders below each &quot;Up to&quot; amount pay that tier&apos;s fee.
                </p>
                <div className="space-y-3">
                  {settings.serviceFeeTiers.map((tier, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-32">{i === 0 ? 'Order under' : 'Up to'}</span>
                      <input
                        type="number"
                        min={1}
                        value={tier.maxAmount}
                        onChange={(e) => {
                          const tiers = [...settings.serviceFeeTiers];
                          tiers[i] = { ...tiers[i], maxAmount: Number(e.target.value) };
                          setSettings({ ...settings, serviceFeeTiers: tiers });
                        }}
                        className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      />
                      <span className="text-sm text-gray-500">MRU &nbsp;→&nbsp; fee</span>
                      <input
                        type="number"
                        min={0}
                        value={tier.fee}
                        onChange={(e) => {
                          const tiers = [...settings.serviceFeeTiers];
                          tiers[i] = { ...tiers[i], fee: Number(e.target.value) };
                          setSettings({ ...settings, serviceFeeTiers: tiers });
                        }}
                        className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      />
                      <span className="text-sm text-gray-500">MRU</span>
                      {settings.serviceFeeTiers.length > 1 && (
                        <button
                          onClick={() => setSettings({
                            ...settings,
                            serviceFeeTiers: settings.serviceFeeTiers.filter((_, j) => j !== i),
                          })}
                          className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700 w-32">Above last tier</span>
                    <span className="text-sm text-gray-500">fee</span>
                    <input
                      type="number"
                      min={0}
                      value={settings.serviceFeeAbove}
                      onChange={(e) => setSettings({ ...settings, serviceFeeAbove: Number(e.target.value) })}
                      className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                    <span className="text-sm text-gray-500">MRU</span>
                  </div>
                  <button
                    onClick={() => {
                      const last = settings.serviceFeeTiers[settings.serviceFeeTiers.length - 1];
                      setSettings({
                        ...settings,
                        serviceFeeTiers: [
                          ...settings.serviceFeeTiers,
                          { maxAmount: (last?.maxAmount || 0) + 1000, fee: (last?.fee || 0) + 50 },
                        ],
                      });
                    }}
                    className="mt-1 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    + Add Tier
                  </button>
                </div>
              </div>

              {/* Withdrawal Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Withdrawal Settings</h2>
                <p className="text-sm text-gray-500 mb-4">Set the minimum amount riders and pharmacies can withdraw from their wallet.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Minimum Withdrawal Amount (MRU)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.minWithdrawalAmount}
                      onChange={(e) => setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">Users cannot request a withdrawal below this amount.</p>
                  </div>
                </div>
              </div>

              {/* Contact Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Razorpay Payment Gateway</h2>
                <p className="text-sm text-gray-500 mb-4">Configure your Razorpay API keys for payment processing.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Key ID
                    </label>
                    <input
                      type="text"
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      placeholder="rzp_live_xxxxxxxxxxxx"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Key Secret
                    </label>
                    <input
                      type="password"
                      value={settings.razorpayKeySecret}
                      onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                      placeholder="Enter new secret to update"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave unchanged to keep existing secret.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
