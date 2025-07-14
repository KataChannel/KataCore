import { Metadata } from 'next';
import SuperAdminDashboard from '@/components/admin/SuperAdminDashboard';

export const metadata: Metadata = {
  title: 'Super Administrator - TazaCore',
  description: 'Super Administrator dashboard for complete system management',
};

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SuperAdminDashboard />
      </div>
    </div>
  );
}
