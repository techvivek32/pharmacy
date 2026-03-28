'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/admin' },
    { name: 'Orders', icon: '📦', path: '/admin/orders' },
    { name: 'Patients', icon: '👥', path: '/admin/patients' },
    { name: 'Pharmacies', icon: '🏥', path: '/admin/pharmacies' },
    { name: 'Riders', icon: '🏍️', path: '/admin/riders' },
    { name: 'Prescriptions', icon: '📋', path: '/admin/prescriptions' },
    { name: 'Analytics', icon: '📈', path: '/admin/analytics' },
    { name: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-white shadow-lg transition-all duration-300 overflow-hidden`}
    >
      <div className="flex items-center justify-center h-20 border-b px-4">
        <img src="/images/logo-2.png" alt="Logo" className="h-14 w-auto object-contain" />
      </div>

      <div className="flex flex-col h-[calc(100%-5rem)]">
        <nav className="mt-6 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                pathname === item.path ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
              }`}
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="text-2xl mr-3">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
