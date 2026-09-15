import type { Metadata } from 'next';
import AdminDashboard from '@/components/adminPanel/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
