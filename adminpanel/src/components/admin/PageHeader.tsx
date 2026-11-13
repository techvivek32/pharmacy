'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar: () => void;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, onToggleSidebar, actions }: PageHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
