import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'OrdoGo Admin',
  description: 'Admin Dashboard for OrdoGo Platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
