'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const icon = (d: string): ReactNode => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore — navigate away regardless
    }
    // Hard navigation so the browser makes a fresh request with the cleared
    // cookie; a client-side router push can be bounced back by middleware
    // if the cookie clear hasn't been applied yet.
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: icon('M4 5a1 1 0 011-1h5v7H4V5zm0 9a1 1 0 011-1h5v7H5a1 1 0 01-1-1v-5zm10-10h5a1 1 0 011 1v5h-6V4zm0 8h6v7a1 1 0 01-1 1h-5v-8z') },
    { name: 'Registration Requests', path: '/admin/registration-requests', icon: icon('M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9') },
    { name: 'Orders', path: '/admin/orders', icon: icon('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z') },
    { name: 'Patients', path: '/admin/patients', icon: icon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z') },
    { name: 'Pharmacies', path: '/admin/pharmacies', icon: icon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4') },
    { name: 'Pharmacy Revenue', path: '/admin/pharmacy-revenue', icon: icon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z') },
    { name: 'Riders', path: '/admin/riders', icon: icon('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z') },
    { name: 'Prescriptions', path: '/admin/prescriptions', icon: icon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z') },
    { name: 'Analytics', path: '/admin/analytics', icon: icon('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z') },
    { name: 'Settings', path: '/admin/settings', icon: icon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z') },
  ];

  const isActive = (path: string) =>
    path === '/admin' ? pathname === '/admin' : pathname === path || pathname.startsWith(path + '/');

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } relative shrink-0 overflow-hidden transition-all duration-300 bg-slate-900`}
    >
      {/* brand gradient accent at top */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-700/40 to-transparent pointer-events-none" />

      <div className="relative w-64 h-full flex flex-col">
        {/* Brand header */}
        <div className="flex items-center justify-center h-20 px-5 border-b border-white/10">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-lg shadow-black/20">
            <img src="/images/logo-2.png" alt="OrdoGo" className="h-12 w-auto object-contain" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/15 transition-colors"
          >
            {icon('M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1')}
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
