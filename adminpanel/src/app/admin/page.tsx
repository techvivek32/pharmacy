'use client';

import AdminShell from '@/components/admin/AdminShell';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentOrders from '@/components/admin/RecentOrders';
import RevenueChart from '@/components/admin/RevenueChart';

export default function Dashboard() {
  return (
    <AdminShell title="Dashboard">
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <RevenueChart />
        <RecentOrders />
      </div>
    </AdminShell>
  );
}
